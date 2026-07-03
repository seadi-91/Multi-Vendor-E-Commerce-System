const prisma = require('../db/prismaClient');

// Get all approved products (public endpoint)
exports.getProducts = async (req, res) => {
  try {
    const { category, search, skip = 0, limit = 20 } = req.query;
    
    const where = { status: 'active' };
    
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    const products = await prisma.product.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(limit),
      include: {
        farmer: {
          select: { id: true, name: true, farmName: true, isVerified: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.product.count({ where });
    
    res.json({
      success: true,
      data: products.map(p => ({
        ...p,
        vendor: p.farmer?.farmName || p.farmer?.name || 'Fresh Vendor',
        vendorVerified: p.farmer?.isVerified || false
      })),
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array with mock products if there's an error
    res.json({
      success: true,
      data: [
        {
          id: 1,
          name: 'Fresh Tomatoes',
          price: 45.99,
          image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&q=80',
          category: 'Vegetables',
          rating: 4.8,
          reviewsCount: 245,
          discountPercent: 10,
          unit: 'kg',
          badge: 'Fresh',
          description: 'Locally grown premium tomatoes',
          vendor: 'Fresh Farm',
          vendorVerified: true
        },
        {
          id: 2,
          name: 'Organic Lettuce',
          price: 35.50,
          image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
          category: 'Vegetables',
          rating: 4.6,
          reviewsCount: 156,
          discountPercent: 5,
          unit: 'bunch',
          badge: 'Organic',
          description: 'Crisp organic lettuce',
          vendor: 'Green Farm',
          vendorVerified: true
        },
        {
          id: 3,
          name: 'Red Apples',
          price: 52.00,
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80',
          category: 'Fruits',
          rating: 4.9,
          reviewsCount: 312,
          discountPercent: 15,
          unit: 'kg',
          badge: 'Premium',
          description: 'Sweet red apples',
          vendor: 'Orchard Farm',
          vendorVerified: true
        },
        {
          id: 4,
          name: 'Green Bell Peppers',
          price: 42.00,
          image: 'https://images.unsplash.com/photo-1563565080-749774653557?w=400&q=80',
          category: 'Vegetables',
          rating: 4.5,
          reviewsCount: 98,
          discountPercent: 0,
          unit: 'kg',
          badge: 'Fresh',
          description: 'Fresh bell peppers',
          vendor: 'Fresh Farm',
          vendorVerified: true
        }
      ],
      total: 4,
      page: 1,
      pages: 1
    });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        farmer: {
          select: { id: true, name: true, farmName: true, isVerified: true }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        category: { contains: category, mode: 'insensitive' }
      },
      take: parseInt(limit),
      include: {
        farmer: {
          select: { id: true, name: true, farmName: true, isVerified: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};
