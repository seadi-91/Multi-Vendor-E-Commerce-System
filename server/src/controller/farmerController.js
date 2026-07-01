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
    const farmerId = req.user.id;
    console.log('Farmer ID:', farmerId);

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
    res.status(500).json({ error: error.message });
  }
};

// Product Management
exports.getFarmerProducts = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const products = await prisma.product.findMany({
      where: { farmerId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const farmerId = req.user.id;
    console.log('=== Creating Product ===');
    console.log('Farmer ID:', farmerId);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    const {
      name, description, price, stock, totalStock, minOrderQuantity, unit, category, badges,
      sku, discountPrice, brand, tags, isOrganic, harvestDate, expiryDate
    } = req.body;

    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
      imageUrl = result.secure_url;
      console.log('Image uploaded:', imageUrl);
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        totalStock: Number(totalStock) || Number(stock) || 0,
        minOrderQuantity: Number(minOrderQuantity) || 1,
        unit,
        category,
        brand,
        sku,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        isOrganic: isOrganic === 'true' || isOrganic === true,
        harvestDate: harvestDate ? new Date(harvestDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        badges: badges ? badges.split(',') : [],
        tags: tags ? tags.split(',') : [],
        image: imageUrl,
        farmerId,
        status: 'pending',
      }
    });

    console.log('Product created:', product);

    // Create notification for all admin users
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
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { 
      name, description, price, stock, totalStock, minOrderQuantity, unit, category, badges,
      sku, discountPrice, brand, tags, isOrganic, harvestDate, expiryDate
    } = req.body;
    const farmerId = req.user.id;
    const productId = parseInt(req.params.id);

    // Verify ownership
    const existing = await prisma.product.findFirst({ where: { id: productId, farmerId } });
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    let updateData = {
      name,
      description,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      totalStock: Number(totalStock) || Number(stock) || 0,
      minOrderQuantity: Number(minOrderQuantity) || 1,
      unit,
      category,
      brand,
      sku,
      discountPrice: discountPrice ? Number(discountPrice) : null,
      isOrganic: isOrganic === 'true' || isOrganic === true,
      harvestDate: harvestDate ? new Date(harvestDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    };
    if (badges) updateData.badges = badges.split(',');
    if (tags) updateData.tags = tags.split(',');

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
      updateData.image = result.secure_url;
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    console.log('=== Deleting Farmer Product ===');
    const farmerId = req.user.id;
    const productId = parseInt(req.params.id);
    console.log('Farmer ID:', farmerId);
    console.log('Product ID:', productId);

    // Verify ownership
    const existing = await prisma.product.findFirst({ where: { id: productId, farmerId } });
    if (!existing) {
      console.log('Product not found or not owned by farmer');
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.product.delete({ where: { id: productId } });
    console.log('Product deleted successfully');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: error.message });
  }
};

// Order Management
exports.getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;
    console.log('=== Fetching Farmer Orders ===');
    console.log('Farmer ID:', farmerId);

    // Get all order items for this farmer's products
    const orderItems = await prisma.orderItem.findMany({
      where: { farmerId },
      include: {
        order: {
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

    console.log('Order items found:', orderItems.length);

    // Group by order
    const ordersMap = new Map();
    orderItems.forEach(item => {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          id: item.orderId,
          total: item.order.total,
          status: item.order.status,
          customerName: item.order.customerName,
          customerEmail: item.order.customerEmail,
          customerPhone: item.order.customerPhone,
          customerAddress: item.order.customerAddress,
          notes: item.order.notes,
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

    const orders = Array.from(ordersMap.values());
    console.log('Orders:', orders);

    res.json(orders);
  } catch (error) {
    console.error('Error fetching farmer orders:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
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
          customerName: item.order.customerName,
          customerEmail: item.order.customerEmail,
          customerPhone: item.order.customerPhone,
          customerAddress: item.order.customerAddress,
          notes: item.order.notes,
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
    res.status(500).json({ error: error.message });
  }
};

exports.getCompletedOrders = async (req, res) => {
  try {
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
          customerName: item.order.customerName,
          customerEmail: item.order.customerEmail,
          customerPhone: item.order.customerPhone,
          customerAddress: item.order.customerAddress,
          notes: item.order.notes,
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
    res.status(500).json({ error: error.message });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'completed' }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Earnings
exports.getEarnings = async (req, res) => {
  try {
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
    res.status(500).json({ error: error.message });
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
    // In a real app, this would create a withdrawal request
    res.json({ message: 'Withdrawal request submitted', amount });
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
        profileImage: true,
        farmName: true,
        farmSize: true,
        bio: true,
        isVerified: true,
        createdAt: true
      }
    });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFarmerProfile = async (req, res) => {
  try {
    const { name, email, phone, address, profileImage, farmName, farmSize, bio } = req.body;
    const farmer = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, phone, address, profileImage, farmName, farmSize, bio }
    });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Farmer Settings
exports.getFarmerSettings = async (req, res) => {
  try {
    const farmer = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        language: true,
        timezone: true,
        bankName: true,
        accountNumber: true,
        paymentMethod: true,
        autoWithdrawal: true,
        withdrawalThreshold: true,
        twoFactor: true,
        loginAlerts: true,
        sessionTimeout: true
      }
    });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFarmerSettings = async (req, res) => {
  try {
    const settings = req.body;
    const farmer = await prisma.user.update({
      where: { id: req.user.id },
      data: settings
    });
    res.json(farmer);
  } catch (error) {
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

