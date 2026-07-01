const { prisma } = require('../db/connectDB');

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('=== Fetching Admin Dashboard Stats ===');
    const totalUsers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalFarmers = await prisma.user.count({ where: { role: 'FARMER' } });
    const totalProducts = await prisma.product.count();
    const pendingFarmers = await prisma.user.count({ where: { role: 'FARMER', isVerified: false } });
    const pendingProducts = await prisma.product.count({ where: { status: 'pending' } });
    const activeUsers = await prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } });

    // Order statistics
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
    const completedOrders = await prisma.order.count({ where: { status: 'completed' } });
    const cancelledOrders = await prisma.order.count({ where: { status: 'cancelled' } });

    // Calculate total earnings
    const orders = await prisma.order.findMany({ where: { status: 'completed' } });
    const totalEarnings = orders.reduce((sum, order) => sum + order.total, 0);

    // Inventory statistics
    const lowStockProducts = await prisma.product.count({ where: { stock: { lt: 10 } } });
    const outOfStockProducts = await prisma.product.count({ where: { stock: 0 } });

    console.log('Stats calculated:', {
      totalOrders,
      totalEarnings,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts
    });

    res.json({
      totalUsers,
      totalFarmers,
      totalProducts,
      pendingFarmers,
      pendingProducts,
      activeUsers,
      totalOrders,
      totalEarnings,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      inventoryAlerts: outOfStockProducts,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: {
        id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER', isActive: true },
      select: {
        id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSuspendedUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER', isActive: false },
      select: {
        id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: false },
      select: { id: true, name: true, email: true, isActive: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: true },
      select: { id: true, name: true, email: true, isActive: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    console.log('=== Deleting User ===');
    console.log('User ID:', req.params.id);

    // Check if user has products
    const userProducts = await prisma.product.count({
      where: { farmerId: parseInt(req.params.id) }
    });
    console.log('User products count:', userProducts);

    if (userProducts > 0) {
      // Delete user's products first
      await prisma.product.deleteMany({
        where: { farmerId: parseInt(req.params.id) }
      });
      console.log('Deleted user products');
    }

    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });
    console.log('User deleted successfully');
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
};

// Farmer Management
exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      select: {
        id: true, name: true, email: true, role: true, phone: true, address: true, isVerified: true, createdAt: true, farmName: true, bio: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingFarmers = async (req, res) => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER', isVerified: false },
      select: {
        id: true, name: true, email: true, role: true, phone: true, address: true, isVerified: true, createdAt: true, farmName: true, bio: true, nationalId: true, tinNumber: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVerifiedFarmers = async (req, res) => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER', isVerified: true },
      select: {
        id: true, name: true, email: true, role: true, phone: true, address: true, isVerified: true, createdAt: true, farmName: true, bio: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyFarmer = async (req, res) => {
  try {
    const farmer = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isVerified: true },
      select: { id: true, name: true, email: true, isVerified: true }
    });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectFarmer = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Farmer rejected and deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Order Management
exports.getAllOrders = async (req, res) => {
  try {
    console.log('=== Fetching All Orders ===');
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        },
        items: {
          include: {
            product: {
              include: {
                farmer: {
                  select: { name: true, email: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Orders found:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: {
          include: {
            product: {
              select: { name: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reports
exports.getReports = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: { include: { farmer: { select: { name: true } } } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const monthlyRevenue = orders.reduce((sum, order) => {
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
        return sum + order.total;
      }
      return sum;
    }, 0);

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10
    });

    res.json({
      totalOrders: orders.length,
      monthlyRevenue,
      topProducts,
      recentOrders: orders.slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Transactions
exports.getTransactions = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transactions = orders.map(order => ({
      id: order.id,
      date: order.createdAt,
      amount: order.total,
      status: order.status,
      customer: order.customerName,
      customerEmail: order.customerEmail
    }));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profileImage: true,
        createdAt: true
      }
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, address, profileImage } = req.body;
    const admin = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, phone, address, profileImage }
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Product Management
exports.getAllProducts = async (req, res) => {
  try {
    console.log('=== Fetching All Products ===');
    const products = await prisma.product.findMany({
      include: {
        farmer: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('All products found:', products.length);
    console.log('Products:', products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingProducts = async (req, res) => {
  try {
    console.log('=== Fetching Pending Products ===');
    const products = await prisma.product.findMany({
      where: { status: 'pending' },
      include: {
        farmer: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log('Pending products found:', products.length);
    console.log('Products:', products);
    res.json(products);
  } catch (error) {
    console.error('Error fetching pending products:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'approved' },
      include: {
        farmer: {
          select: { name: true, email: true }
        }
      }
    });

    // Create notification for the farmer
    await prisma.notification.create({
      data: {
        type: 'product_approved',
        title: 'Product Approved',
        message: `Your product "${product.name}" has been approved and is now visible on the marketplace`,
        userId: product.farmerId,
        productId: product.id
      }
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'rejected' },
      include: {
        farmer: {
          select: { name: true, email: true }
        }
      }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Analytics & Reports
exports.getReports = async (req, res) => {
  try {
    // Prisma aggregation for revenue
    const revenueAgg = await prisma.product.aggregate({
      where: { status: 'approved' },
      _sum: { price: true }
    });
    const totalRevenue = revenueAgg._sum.price || 0;

    // Prisma group by for category count
    const productsByCategoryRaw = await prisma.product.groupBy({
      by: ['category'],
      where: { status: 'approved' },
      _count: { category: true }
    });
    
    const productsByCategory = productsByCategoryRaw.map(item => ({
      _id: item.category,
      count: item._count.category
    }));

    // For monthly sales we'll do a simple raw query or JS processing
    // For simplicity, returning empty for now since we don't have orders yet
    const monthlySales = [];

    res.json({
      totalRevenue,
      productsByCategory,
      monthlySales,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    res.json({
      message: 'Transaction endpoint - implement Order model for full functionality',
      transactions: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin Profile
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true, phone: true, location: true
      }
    });
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, location } = req.body;
    const admin = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, email, phone, location },
      select: {
        id: true, name: true, email: true, role: true, phone: true, location: true
      }
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Notification Management
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          select: { name: true, image: true, category: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
