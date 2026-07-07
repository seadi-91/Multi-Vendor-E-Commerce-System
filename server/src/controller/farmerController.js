const { prisma } = require('../db/connectDB');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('=== Fetching Farmer Dashboard Stats ===');
    
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    console.log('Farmer ID:', farmerId);

    // Verify farmer exists
    const farmer = await prisma.user.findUnique({
      where: { id: farmerId, role: 'FARMER' }
    });
    
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer account not found' });
    }

    const totalProducts = await prisma.product.count({ where: { farmerId } });

    // Get order items for this farmer
    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId },
      include: {
        order: true
      }
    });

    // Calculate order statistics
    const totalOrders = new Set(orderItems.map(item => item.orderId)).size;
    const pendingOrders = new Set(orderItems.filter(item => item.order.status === 'pending').map(item => item.orderId)).size;
    const completedOrders = new Set(orderItems.filter(item => item.order.status === 'completed').map(item => item.orderId)).size;
    const cancelledOrders = new Set(orderItems.filter(item => item.order.status === 'cancelled').map(item => item.orderId)).size;

    // Calculate earnings from completed orders
    const completedOrderItems = orderItems.filter(item => item.order.status === 'completed');
    const totalEarnings = completedOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate monthly revenue (current month)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrderItems = completedOrderItems.filter(item => new Date(item.order.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlyOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Inventory statistics
    const products = await prisma.product.findMany({ where: { farmerId } });
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;

    console.log('Farmer stats calculated:', {
      totalProducts,
      totalOrders,
      totalEarnings,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      monthlyRevenue
    });

    res.json({
      totalProducts,
      totalOrders,
      totalEarnings,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      inventoryAlerts: outOfStockProducts,
      monthlyRevenue,
    });
  } catch (error) {
    console.error('Error fetching farmer dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics. Please try again later.' });
  }
};

// Product Management
exports.getFarmerProducts = async (req, res) => {
  try {
    console.log('=== Fetching Farmer Products ===');
    
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    console.log('Farmer ID:', farmerId);
    
    // **CRITICAL: Verify farmer exists (prevents 500 errors after deletion)**
    const farmer = await prisma.user.findUnique({
      where: { id: farmerId },
      select: { id: true, role: true, isActive: true }
    });
    
    if (!farmer) {
      console.log('Farmer account not found - likely deleted');
      return res.status(404).json({ 
        error: 'Farmer account not found. Your account may have been removed.',
        code: 'FARMER_NOT_FOUND'
      });
    }
    
    if (farmer.role !== 'FARMER') {
      return res.status(403).json({ error: 'Only farmers can access this endpoint' });
    }
    
    // Validate pagination parameters
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    
    console.log('Pagination params - page:', page, 'limit:', limit);
    
    const products = await prisma.product.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    
    const total = await prisma.product.count({ where: { farmerId } });
    
    console.log('Products fetched:', products.length, 'Total:', total);
    
    res.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching farmer products:', error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Farmer account not found' });
    }
    
    res.status(500).json({ error: 'Failed to fetch products. Please try again later.' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log('=== Creating Product ===');
    
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    console.log('Farmer ID:', farmerId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // **BUSINESS RULE 1: Check if farmer is verified**
    const farmer = await prisma.user.findUnique({
      where: { id: farmerId },
      select: { isVerified: true, isActive: true, role: true }
    });
    
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer account not found' });
    }
    
    if (farmer.role !== 'FARMER') {
      return res.status(403).json({ error: 'Only farmers can create products' });
    }
    
    if (!farmer.isVerified) {
      return res.status(403).json({ 
        error: 'Your account must be verified before you can add products. Please contact admin for verification.',
        code: 'FARMER_NOT_VERIFIED'
      });
    }
    
    if (!farmer.isActive) {
      return res.status(403).json({ 
        error: 'Your account is currently suspended. Please contact admin.',
        code: 'FARMER_SUSPENDED'
      });
    }

    const {
      name, description, price, stock, totalStock, minOrderQuantity, unit, category, customCategory, badges,
      sku, discountPrice, brand, tags, isOrganic, harvestDate, expiryDate
    } = req.body;

    // **Handle custom category (when category === 'Others')**
    const finalCategory = category === 'Others' && customCategory 
      ? customCategory.trim() 
      : category;

    // Validate required fields
    if (!name || !price || !stock || !finalCategory) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, price, stock, and category are required' 
      });
    }

    // Validate price and stock are positive numbers
    const numericPrice = Number(price);
    const numericStock = Number(stock);
    
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ error: 'Price must be a positive number' });
    }
    
    if (isNaN(numericStock) || numericStock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    // Validate discount price if provided
    if (discountPrice) {
      const numericDiscountPrice = Number(discountPrice);
      if (isNaN(numericDiscountPrice) || numericDiscountPrice <= 0) {
        return res.status(400).json({ error: 'Discount price must be a positive number' });
      }
      if (numericDiscountPrice >= numericPrice) {
        return res.status(400).json({ error: 'Discount price must be less than regular price' });
      }
    }

    let imageUrl = '';
    if (req.file) {
      try {
        // Check if Cloudinary is configured
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
          console.warn('Cloudinary credentials not configured. Skipping image upload.');
          // Don't fail the request, just skip the upload
        } else {
          const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
          imageUrl = result.secure_url;
          console.log('Image uploaded:', imageUrl);
        }
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        // Don't fail the product creation if image upload fails
        console.warn('Product will be created without image');
      }
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description?.trim() || '',
        price: numericPrice,
        stock: numericStock,
        totalStock: totalStock !== undefined ? Number(totalStock) : numericStock,
        minOrderQuantity: Number(minOrderQuantity) || 1,
        unit,
        category: finalCategory,  // Use finalCategory to handle custom categories
        brand,
        sku,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        isOrganic: isOrganic === 'true' || isOrganic === true,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        badges: badges ? badges.split(',').map(b => b.trim()).filter(Boolean) : [],
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        image: imageUrl,
        farmerId,
        status: 'pending', // Will be 'approved' by admin before showing in marketplace
      }
    });

    console.log('Product created:', product);

    // Create notification for all admin users
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
      });

      console.log('Admins found:', admins.length);

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            type: 'product_pending',
            title: 'New Product Pending Approval',
            message: `Farmer has submitted "${name}" for approval`,
            userId: admin.id,
            productId: product.id
          }
        });
      }

      console.log('Notifications created');
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      // Don't fail the product creation if notifications fail
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('=== ERROR in createProduct ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A product with this SKU already exists' });
    }
    
    // Catch any unexpected errors to prevent server crash
    res.status(500).json({ 
      error: 'Failed to create product. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const { 
      name, description, price, stock, minOrderQuantity, unit, category, badges,
      sku, discountPrice, brand, tags, isOrganic, harvestDate, expiryDate
    } = req.body;
    const farmerId = req.user.id;
    const productId = parseInt(req.params.id);

    // Validate product ID
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Verify ownership
    const existing = await prisma.product.findFirst({ where: { id: productId, farmerId } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found or you do not have permission to update it' });
    }

    // Validate price and stock if provided
    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number' });
      }
    }

    if (stock !== undefined) {
      const numericStock = Number(stock);
      if (isNaN(numericStock) || numericStock < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative number' });
      }
    }

    // Validate discount price if provided
    if (discountPrice) {
      const numericDiscountPrice = Number(discountPrice);
      const currentPrice = Number(price) || existing.price;
      if (isNaN(numericDiscountPrice) || numericDiscountPrice <= 0) {
        return res.status(400).json({ error: 'Discount price must be a positive number' });
      }
      if (numericDiscountPrice >= currentPrice) {
        return res.status(400).json({ error: 'Discount price must be less than regular price' });
      }
    }

    let updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (totalStock !== undefined) updateData.totalStock = Number(totalStock) || Number(stock) || 0;
    if (minOrderQuantity !== undefined) updateData.minOrderQuantity = Number(minOrderQuantity) || 1;
    if (unit !== undefined) updateData.unit = unit;
    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (sku !== undefined) updateData.sku = sku;
    if (discountPrice !== undefined) updateData.discountPrice = Number(discountPrice) || null;
    if (isOrganic !== undefined) updateData.isOrganic = isOrganic === 'true' || isOrganic === true;
    if (harvestDate !== undefined) updateData.harvestDate = harvestDate ? new Date(harvestDate) : null;
    if (expiryDate !== undefined) updateData.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (badges) updateData.badges = badges.split(',').map(b => b.trim()).filter(Boolean);
    if (tags) updateData.tags = tags.split(',').map(t => t.trim()).filter(Boolean);

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
        updateData.image = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return res.status(500).json({ error: 'Failed to upload product image' });
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'A product with this SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to update product. Please try again later.' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    console.log('=== Deleting Farmer Product ===');
    
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    const productId = parseInt(req.params.id);
    console.log('Farmer ID:', farmerId);
    console.log('Product ID:', productId);

    // Validate product ID
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Verify ownership
    const existing = await prisma.product.findFirst({ where: { id: productId, farmerId } });
    if (!existing) {
      console.log('Product not found or not owned by farmer');
      return res.status(404).json({ error: 'Product not found or you do not have permission to delete it' });
    }

    // Check if product has active orders
    const activeOrderItems = await prisma.orderItem.findMany({
      where: { 
        productId,
        order: { status: { in: ['pending', 'processing', 'on the way'] } }
      }
    });

    if (activeOrderItems.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product with active orders. Please cancel the orders first.' 
      });
    }

    await prisma.product.delete({ where: { id: productId } });
    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product. Please try again later.' });
  }
};

// Order Management
exports.getFarmerOrders = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    console.log('=== Fetching Farmer Orders ===');
    console.log('Farmer ID:', farmerId);

    // Validate pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    // Build where clause
    const whereClause = { farmerId };
    if (status && ['pending', 'processing', 'on the way', 'delivered', 'completed', 'cancelled'].includes(status)) {
      whereClause.order = { status };
    }

    console.log('Where clause:', JSON.stringify(whereClause));

    // Get all order items for this farmer's products
    const orderItems = await prisma.orderItem.findMany({
      where: whereClause,
      include: {
        order: true,
        product: {
          select: { name: true, image: true, unit: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Order items found:', orderItems.length);
    if (orderItems.length > 0) {
      console.log('Sample order item:', JSON.stringify(orderItems[0], null, 2));
    }

    // Group by order
    const ordersMap = new Map();
    orderItems.forEach(item => {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          id: item.orderId,
          orderNumber: `ORD-${String(item.orderId).padStart(6, '0')}`,
          total: item.order.total,
          status: item.order.status,
          customerName: item.order.fullName,
          customerEmail: item.order.email,
          customerPhone: item.order.phone,
          customerAddress: item.order.address,
          notes: item.order.additionalInfo,
          specialInstructions: item.order.specialInstructions,
          subtotal: item.order.subtotal,
          tax: item.order.tax,
          deliveryFee: item.order.deliveryFee,
          createdAt: item.order.createdAt,
          items: []
        });
      }
      ordersMap.get(item.orderId).items.push({
        id: item.id,
        name: item.product.name,
        image: item.product.image,
        quantity: item.quantity,
        price: item.price,
        unit: item.product.unit
      });
    });

    const orders = Array.from(ordersMap.values());
    console.log('Orders grouped:', orders.length);
    if (orders.length > 0) {
      console.log('Sample order:', JSON.stringify(orders[0], null, 2));
    }

    // Apply pagination
    const total = orders.length;
    const paginatedOrders = orders.slice((page - 1) * limit, page * limit);

    res.json({
      orders: paginatedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders. Please try again later.' });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId },
      include: {
        order: {
          where: { status: 'pending' },
          include: {
            user: {
              select: { name: true, email: true, phone: true }
            }
          }
        },
        product: {
          select: { name: true, image: true, unit: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const ordersMap = new Map();
    orderItems.forEach(item => {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          id: item.orderId,
          total: item.order.total,
          status: item.order.status,
          customerName: item.order.fullName,
          customerEmail: item.order.email,
          customerPhone: item.order.phone,
          customerAddress: item.order.address,
          notes: item.order.additionalInfo,
          createdAt: item.order.createdAt,
          items: []
        });
      }
      ordersMap.get(item.orderId).items.push({
        id: item.id,
        productName: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        price: item.price,
        unit: item.product.unit
      });
    });

    res.json(Array.from(ordersMap.values()));
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ error: 'Failed to fetch pending orders. Please try again later.' });
  }
};

exports.getCompletedOrders = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId },
      include: {
        order: {
          where: { status: 'completed' },
          include: {
            user: {
              select: { name: true, email: true, phone: true }
            }
          }
        },
        product: {
          select: { name: true, image: true, unit: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const ordersMap = new Map();
    orderItems.forEach(item => {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          id: item.orderId,
          total: item.order.total,
          status: item.order.status,
          customerName: item.order.fullName,
          customerEmail: item.order.email,
          customerPhone: item.order.phone,
          customerAddress: item.order.address,
          notes: item.order.additionalInfo,
          createdAt: item.order.createdAt,
          items: []
        });
      }
      ordersMap.get(item.orderId).items.push({
        id: item.id,
        productName: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        price: item.price,
        unit: item.product.unit
      });
    });

    res.json(Array.from(ordersMap.values()));
  } catch (error) {
    console.error('Error fetching completed orders:', error);
    res.status(500).json({ error: 'Failed to fetch completed orders. Please try again later.' });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const orderId = parseInt(req.params.id);
    
    // Validate order ID
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Verify order belongs to farmer
    const orderItem = await prisma.orderItem.findFirst({
      where: { 
        orderId,
        farmerId: req.user.id 
      }
    });

    if (!orderItem) {
      return res.status(404).json({ error: 'Order not found or you do not have permission to update it' });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' }
    });
    res.json(order);
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ error: 'Failed to complete order. Please try again later.' });
  }
};

// Earnings
exports.getEarnings = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId },
      include: { order: true }
    });

    const completedOrderItems = orderItems.filter(item => item.order.status === 'completed');
    const totalEarnings = completedOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrderItems = completedOrderItems.filter(item => new Date(item.order.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlyOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    res.json({
      totalEarnings,
      monthlyRevenue,
      availableForWithdrawal: monthlyRevenue * 0.8 // 80% available for withdrawal
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings. Please try again later.' });
  }
};

exports.getEarningsReports = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId },
      include: { order: true, product: true }
    });

    const monthlyData = {};
    orderItems.forEach(item => {
      if (item.order.status === 'completed') {
        const date = new Date(item.order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += item.price * item.quantity;
      }
    });

    res.json({
      monthlyData,
      totalEarnings: orderItems.filter(item => item.order.status === 'completed')
        .reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const farmerId = req.user.id;
    // Compute available amount (same logic as getEarnings)
    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId },
      include: { order: true }
    });
    const completedOrderItems = orderItems.filter(item => item.order.status === 'completed');
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrderItems = completedOrderItems.filter(item => new Date(item.order.createdAt) >= startOfMonth);
    const monthlyRevenue = monthlyOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const availableForWithdrawal = monthlyRevenue * 0.8; // 80% available

    if (amount <= 0) {
      return res.status(400).json({ error: 'Withdrawal amount must be greater than zero' });
    }
    if (amount > availableForWithdrawal) {
      return res.status(400).json({ error: 'Requested amount exceeds available balance' });
    }
    // Create a withdrawal request record
    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        farmerId,
        amount,
        status: 'PENDING'
      }
    });
    res.json({ message: 'Withdrawal request submitted', withdrawal });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const products = await prisma.product.findMany({ where: { farmerId } });
    const productIds = products.map(p => p.id);

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: { order: true }
    });

    const salesByProduct = {};
    orderItems.forEach(item => {
      if (item.order.status === 'completed') {
        if (!salesByProduct[item.productId]) {
          salesByProduct[item.productId] = { quantity: 0, revenue: 0 };
        }
        salesByProduct[item.productId].quantity += item.quantity;
        salesByProduct[item.productId].revenue += item.price * item.quantity;
      }
    });

    res.json({
      salesByProduct,
      totalSales: orderItems.filter(item => item.order.status === 'completed')
        .reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrafficAnalytics = async (req, res) => {
  try {
    // Mock data - in real app would track page views
    res.json({
      dailyViews: [120, 150, 180, 200, 170, 190, 210],
      totalViews: 1220,
      uniqueVisitors: 850
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const products = await prisma.product.findMany({ where: { farmerId } });

    const avgRating = 4.5; // Mock - would calculate from reviews
    const totalReviews = 128; // Mock

    res.json({
      avgRating,
      totalReviews,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'approved').length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Farmer Profile
exports.getFarmerProfile = async (req, res) => {
  try {
    const farmer = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        location: true,
        profileImage: true,
        farmName: true,
        farmSize: true,
        bio: true,
        isVerified: true,
        isActive: true,
        certifications: true,
        languages: true,
        nationalId: true,
        tinNumber: true,
        bankName: true,
        accountNumber: true,
        paymentMethod: true,
        createdAt: true
      }
    });
    
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    
    res.json(farmer);
  } catch (error) {
    console.error('Error fetching farmer profile:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateFarmerProfile = async (req, res) => {
  try {
    const { name, email, phone, address, location, profileImage, farmName, farmSize, bio, certifications, languages } = req.body;
    
    const farmer = await prisma.user.update({
      where: { id: req.user.id },
      data: { 
        name, 
        email, 
        phone, 
        address, 
        location,
        profileImage, 
        farmName, 
        farmSize, 
        bio,
        ...(certifications && { certifications }),
        ...(languages && { languages })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        location: true,
        profileImage: true,
        farmName: true,
        farmSize: true,
        bio: true,
        isVerified: true,
        certifications: true,
        languages: true,
        createdAt: true
      }
    });
    
    res.json(farmer);
  } catch (error) {
    console.error('Error updating farmer profile:', error);
    res.status(500).json({ error: error.message });
  }
};

// Farmer Settings
exports.getFarmerSettings = async (req, res) => {
  try {
    const farmer = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        // Profile fields
        name: true,
        email: true,
        phone: true,
        address: true,
        location: true,
        farmName: true,
        farmSize: true,
        bio: true,
        profileImage: true,
        certifications: true,
        languages: true,
        createdAt: true,
        isVerified: true,
        // Settings fields
        language: true,
        timezone: true,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: true,
        // Payment settings
        bankName: true,
        accountNumber: true,
        paymentMethod: true,
        autoWithdrawal: true,
        withdrawalThreshold: true,
        // Security settings
        twoFactor: true,
        loginAlerts: true,
        sessionTimeout: true,
        // Professional settings
        businessLicense: true,
        taxId: true,
        vatRegistered: true,
        vatNumber: true,
        insuranceProvider: true,
        insurancePolicy: true,
        insuranceExpiry: true,
        farmRegistration: true,
        nationalId: true,
        tinNumber: true
      }
    });
    
    if (!farmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }
    
    // Format the joinedDate
    const formattedFarmer = {
      ...farmer,
      joinedDate: farmer.createdAt ? new Date(farmer.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null
    };
    
    res.json(formattedFarmer);
  } catch (error) {
    console.error('Error fetching farmer settings:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateFarmerSettings = async (req, res) => {
  try {
    const settings = req.body;
    
    // Filter out undefined values
    const filteredSettings = Object.fromEntries(
      Object.entries(settings).filter(([_, v]) => v !== undefined)
    );
    
    const farmer = await prisma.user.update({
      where: { id: req.user.id },
      data: filteredSettings
    });
    
    res.json(farmer);
  } catch (error) {
    console.error('Error updating farmer settings:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const farmer = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = await bcrypt.compare(currentPassword, farmer.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New: Fetch categories and subcategories for product wizard
exports.getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { subCategories: { select: { id: true, name: true } } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const subCategories = await prisma.subCategory.findMany({
      where: { categoryId },
      select: { id: true, name: true },
    });
    res.json(subCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Farm Alerts
exports.getAlerts = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'Unauthorized access' });
    }
    
    const farmerId = req.user.id;
    
    // Get farmer's products to generate relevant alerts
    const products = await prisma.product.findMany({
      where: { farmerId },
      select: { 
        id: true, 
        name: true, 
        stock: true, 
        status: true,
        expiryDate: true,
        harvestDate: true
      }
    });

    const alerts = [];
    const now = new Date();

    // Generate alerts based on product data
    products.forEach(product => {
      // Low stock alert
      if (product.stock > 0 && product.stock <= 5) {
        alerts.push({
          id: `low-stock-${product.id}`,
          type: 'warning',
          severity: product.stock <= 2 ? 'high' : 'medium',
          title: 'Low Stock Alert',
          message: `${product.name} has only ${product.stock} units remaining. Consider restocking soon.`,
          timestamp: new Date().toISOString(),
          category: 'Inventory'
        });
      }

      // Out of stock alert
      if (product.stock === 0) {
        alerts.push({
          id: `out-of-stock-${product.id}`,
          type: 'warning',
          severity: 'high',
          title: 'Out of Stock',
          message: `${product.name} is out of stock. Restock to continue selling.`,
          timestamp: new Date().toISOString(),
          category: 'Inventory'
        });
      }

      // Expiry date warning
      if (product.expiryDate) {
        const expiryDate = new Date(product.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          alerts.push({
            id: `expiry-${product.id}`,
            type: 'warning',
            severity: daysUntilExpiry <= 3 ? 'high' : 'medium',
            title: 'Product Expiring Soon',
            message: `${product.name} will expire in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''}. Consider promoting or discounting.`,
            timestamp: new Date().toISOString(),
            category: 'Product Quality'
          });
        }
      }

      // Harvest reminder
      if (product.harvestDate) {
        const harvestDate = new Date(product.harvestDate);
        const daysSinceHarvest = Math.ceil((now - harvestDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceHarvest >= 30) {
          alerts.push({
            id: `harvest-${product.id}`,
            type: 'harvest',
            severity: 'low',
            title: 'Time for New Harvest',
            message: `${product.name} was harvested ${daysSinceHarvest} days ago. Plan your next harvest cycle.`,
            timestamp: new Date().toISOString(),
            category: 'Farming'
          });
        }
      }
    });

    // Add general farming tips if no specific alerts
    if (alerts.length === 0) {
      alerts.push({
        id: 'tip-1',
        type: 'weather',
        severity: 'low',
        title: 'Weather Tip',
        message: 'Monitor weather conditions regularly to optimize your harvest schedule.',
        timestamp: new Date().toISOString(),
        category: 'Tips'
      });
      alerts.push({
        id: 'tip-2',
        type: 'irrigation',
        severity: 'low',
        title: 'Irrigation Reminder',
        message: 'Maintain consistent watering schedules for optimal crop growth.',
        timestamp: new Date().toISOString(),
        category: 'Tips'
      });
    }

    // Sort by severity (high, medium, low)
    const severityOrder = { high: 0, medium: 1, low: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts. Please try again later.' });
  }
};
