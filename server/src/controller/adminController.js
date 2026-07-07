const { prisma } = require('../db/connectDB');
const bcrypt = require('bcrypt');

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    console.log('=== Fetching Admin Dashboard Stats ===');
    
    // Current period
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

    // Previous period (last month) for percentage changes
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const previousMonthUsers = await prisma.user.count({
      where: { 
        role: 'CUSTOMER',
        createdAt: { lt: lastMonth }
      }
    });
    
    const previousMonthFarmers = await prisma.user.count({
      where: { 
        role: 'FARMER',
        createdAt: { lt: lastMonth }
      }
    });
    
    const previousMonthOrders = await prisma.order.count({
      where: { 
        createdAt: { lt: lastMonth }
      }
    });
    
    const previousMonthEarnings = await prisma.order.aggregate({
      where: {
        status: 'completed',
        createdAt: { lt: lastMonth }
      },
      _sum: { total: true }
    });

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const usersChange = calculatePercentageChange(totalUsers, previousMonthUsers);
    const farmersChange = calculatePercentageChange(totalFarmers, previousMonthFarmers);
    const ordersChange = calculatePercentageChange(totalOrders, previousMonthOrders);
    const earningsChange = calculatePercentageChange(totalEarnings, previousMonthEarnings._sum.total || 0);

    console.log('Stats calculated:', {
      totalOrders,
      totalEarnings,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      lowStockProducts,
      outOfStockProducts,
      usersChange,
      farmersChange,
      ordersChange,
      earningsChange
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
      // Percentage changes
      usersChange: usersChange.toFixed(1),
      farmersChange: farmersChange.toFixed(1),
      ordersChange: ordersChange.toFixed(1),
      earningsChange: earningsChange.toFixed(1),
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { status, sortBy, search, page = 1, limit = 10 } = req.query;
    
    // Build where clause for filtering
    const where = { role: 'CUSTOMER' };
    
    if (status && status !== 'All') {
      if (status === 'Active') {
        where.isActive = true;
      } else if (status === 'Inactive' || status === 'Suspended') {
        where.isActive = false;
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ];
    }
    
    // Build orderBy clause for sorting
    let orderBy = { createdAt: 'desc' };
    if (sortBy) {
      switch(sortBy) {
        case 'Newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'Oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'Name A-Z':
          orderBy = { name: 'asc' };
          break;
        case 'Name Z-A':
          orderBy = { name: 'desc' };
          break;
      }
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true,
          profileImage: true, address: true
        },
        orderBy,
        skip,
        take
      }),
      prisma.user.count({ where })
    ]);
    
    res.json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
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
    const userId = parseInt(req.params.id);
    
    // **BUSINESS RULE 3: Suspend user and hide all their products**
    const result = await prisma.$transaction(async (tx) => {
      // Get user to check if they're a farmer
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, isActive: true, role: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Suspend the user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { isActive: false },
        select: { id: true, name: true, email: true, isActive: true, role: true }
      });
      
      // If user is a farmer, hide/suspend all their products
      if (user.role === 'FARMER') {
        const productsUpdated = await tx.product.updateMany({
          where: { 
            farmerId: userId,
            status: { in: ['approved', 'pending'] } // Don't affect already rejected/hidden products
          },
          data: { status: 'suspended' }
        });
        
        console.log(`[ADMIN] Farmer ${userId} suspended. ${productsUpdated.count} products hidden from marketplace.`);
        
        // Create notification for the farmer
        await tx.notification.create({
          data: {
            type: 'ACCOUNT_SUSPENDED',
            title: 'Account Suspended',
            message: 'Your account has been suspended by admin. All your products have been hidden from the marketplace. Please contact support for assistance.',
            userId: userId,
            read: false
          }
        });
      }
      
      return updatedUser;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Failed to suspend user:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // **BUSINESS RULE 3: Activate user and restore their previously suspended products**
    const result = await prisma.$transaction(async (tx) => {
      // Get user to check if they're a farmer
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, isActive: true, role: true, isVerified: true }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Activate the user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { isActive: true },
        select: { id: true, name: true, email: true, isActive: true, role: true }
      });
      
      // If user is a verified farmer, restore their suspended products
      if (user.role === 'FARMER' && user.isVerified) {
        const productsRestored = await tx.product.updateMany({
          where: { 
            farmerId: userId,
            status: 'suspended'
          },
          data: { status: 'approved' } // Restore to approved status
        });
        
        console.log(`[ADMIN] Farmer ${userId} activated. ${productsRestored.count} products restored to marketplace.`);
        
        // Create notification for the farmer
        await tx.notification.create({
          data: {
            type: 'ACCOUNT_ACTIVATED',
            title: 'Account Activated',
            message: 'Your account has been reactivated. Your products are now visible in the marketplace again.',
            userId: userId,
            read: false
          }
        });
      }
      
      return updatedUser;
    });
    
    res.json(result);
  } catch (error) {
    console.error('Failed to activate user:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  const startTime = Date.now();
  
  try {
    console.log('=== START: Delete User ===');
    console.log('Request params ID:', req.params.id);
    console.log('Logged-in admin ID:', req.user.id);
    
    const userId = parseInt(req.params.id);
    const adminId = req.user.id;
    
    // ✅ VALIDATION: Check if userId is valid
    if (!userId || isNaN(userId) || userId <= 0) {
      console.log('❌ VALIDATION FAILED: Invalid user ID');
      return res.status(400).json({ 
        error: 'Invalid user ID',
        message: 'User ID must be a valid positive integer' 
      });
    }
    
    // ✅ CRITICAL: Prevent self-deletion
    if (userId === adminId) {
      console.log('❌ BLOCKED: Admin attempted to delete their own account');
      return res.status(403).json({ 
        error: 'Cannot delete your own account',
        message: 'For security reasons, administrators cannot delete their own accounts. Please contact another administrator.' 
      });
    }
    
    // Use transaction for atomic deletion with proper cleanup
    const result = await prisma.$transaction(async (tx) => {
      console.log('Starting user deletion transaction...');
      
      // Fetch user to check role and get info
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          name: true, 
          email: true, 
          role: true,
          _count: {
            select: {
              products: true,
              orders: true,
              orderItems: true,
              notifications: true,
              reviews: true,
              sentMessages: true,
              receivedMessages: true,
              withdrawalRequests: true
            }
          }
        }
      });
      
      if (!user) {
        console.log('❌ User not found in database');
        throw { statusCode: 404, message: 'User not found' };
      }
      
      // ✅ ADDITIONAL PROTECTION: Prevent deletion of other ADMIN accounts (optional safety measure)
      // Uncomment if you want only one super admin to exist
      // if (user.role === 'ADMIN') {
      //   console.log('❌ BLOCKED: Cannot delete administrator accounts');
      //   throw { statusCode: 403, message: 'Cannot delete administrator accounts' };
      // }
      
      console.log(`Deleting user: ${user.name} (${user.email}) - Role: ${user.role}`);
      console.log('Related records:', user._count);
      
      // For FARMERS: Products, OrderItems, Messages, Notifications, WithdrawalRequests
      // will be automatically CASCADE deleted by Prisma schema
      
      // For CUSTOMERS: Orders have SetNull, Reviews have SetNull
      // These will be kept but customer reference will be nulled
      
      if (user.role === 'FARMER') {
        console.log(`Will cascade delete ${user._count.products} products for farmer ${userId}`);
        console.log(`Will cascade delete ${user._count.orderItems} order items`);
        console.log(`Will cascade delete ${user._count.withdrawalRequests} withdrawal requests`);
      }
      
      if (user._count.notifications > 0) {
        console.log(`Will cascade delete ${user._count.notifications} notifications`);
      }
      
      if (user._count.sentMessages > 0 || user._count.receivedMessages > 0) {
        console.log(`Will cascade delete ${user._count.sentMessages} sent and ${user._count.receivedMessages} received messages`);
      }
      
      // Delete the user (Prisma will handle cascade deletes based on schema)
      await tx.user.delete({
        where: { id: userId }
      });
      
      console.log(`User ${userId} deleted successfully with all related data`);
      
      return {
        deletedUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        relatedRecordsDeleted: user._count
      };
    }, {
      maxWait: 5000, // Maximum time to wait for transaction to start (5 seconds)
      timeout: 30000, // Maximum time for transaction to complete (30 seconds)
      isolationLevel: 'Serializable' // Highest isolation level for data consistency
    });
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ DELETE SUCCESS - Execution time: ${executionTime}ms`);
    console.log('=== END: Delete User - Success ===');
    
    res.json({ 
      success: true,
      message: 'User deleted successfully',
      deletedUser: result.deletedUser,
      relatedRecordsDeleted: result.relatedRecordsDeleted,
      executionTime: `${executionTime}ms`
    });
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('=== END: Delete User - Error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error(`❌ DELETE FAILED - Execution time: ${executionTime}ms`);
    
    // Handle custom errors with status codes
    if (error.statusCode) {
      return res.status(error.statusCode).json({ 
        success: false,
        error: error.message || 'Delete operation failed',
        executionTime: `${executionTime}ms`
      });
    }
    
    // Handle Prisma-specific errors
    if (error.code) {
      console.error('Prisma error code:', error.code);
      
      // P2025: Record not found
      if (error.code === 'P2025') {
        return res.status(404).json({ 
          success: false,
          error: 'User not found',
          message: 'The user you are trying to delete does not exist',
          executionTime: `${executionTime}ms`
        });
      }
      
      // P2003: Foreign key constraint failed
      if (error.code === 'P2003') {
        return res.status(409).json({ 
          success: false,
          error: 'Cannot delete user due to foreign key constraint',
          message: 'This user has related records that prevent deletion. Please contact support.',
          executionTime: `${executionTime}ms`
        });
      }
      
      // P2034: Transaction failed
      if (error.code === 'P2034') {
        return res.status(500).json({ 
          success: false,
          error: 'Transaction conflict',
          message: 'The delete operation conflicted with another operation. Please try again.',
          executionTime: `${executionTime}ms`
        });
      }
    }
    
    // Handle database connection errors
    if (error.message && error.message.includes('connect')) {
      console.error('❌ DATABASE CONNECTION ERROR');
      return res.status(503).json({ 
        success: false,
        error: 'Database connection error',
        message: 'Unable to connect to the database. Please try again later.',
        executionTime: `${executionTime}ms`
      });
    }
    
    // Handle timeout errors
    if (error.message && (error.message.includes('timeout') || error.message.includes('timed out'))) {
      console.error('❌ OPERATION TIMEOUT');
      return res.status(504).json({ 
        success: false,
        error: 'Operation timeout',
        message: 'The delete operation took too long. Please try again.',
        executionTime: `${executionTime}ms`
      });
    }
    
    // Generic error response (prevents server crash)
    console.error('❌ UNHANDLED ERROR - Returning 500');
    return res.status(500).json({ 
      success: false,
      error: 'Failed to delete user',
      message: error.message || 'An unexpected error occurred while deleting the user',
      executionTime: `${executionTime}ms`,
      // Only include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  } finally {
    // Prisma automatically manages connection pooling
    // No need to explicitly close connections in modern Prisma
    console.log('Delete user operation completed');
  }
};

// Farmer Management
exports.getAllFarmers = async (req, res) => {
  try {
    const { status, sortBy, search, page = 1, limit = 10 } = req.query;
    
    // Build where clause for filtering
    const where = { role: 'FARMER' };
    
    if (status && status !== 'All') {
      if (status === 'Verified') {
        where.isVerified = true;
      } else if (status === 'Pending') {
        where.isVerified = false;
      }
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { farmName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Build orderBy clause for sorting
    let orderBy = { createdAt: 'desc' };
    if (sortBy) {
      switch(sortBy) {
        case 'Newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'Oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'Name A-Z':
          orderBy = { name: 'asc' };
          break;
        case 'Name Z-A':
          orderBy = { name: 'desc' };
          break;
        case 'Total Sales High-Low':
          // For sales sorting, we need to calculate sales and sort manually
          break;
        case 'Total Sales Low-High':
          // For sales sorting, we need to calculate sales and sort manually
          break;
      }
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    let farmers;
    let total;
    
    if (sortBy === 'Total Sales High-Low' || sortBy === 'Total Sales Low-High') {
      // Get all farmers with their products for sales calculation
      const allFarmers = await prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, phone: true, address: true, isVerified: true, 
          createdAt: true, farmName: true, bio: true, profileImage: true, isActive: true,
          farmSize: true, nationalId: true, tinNumber: true, bankName: true, accountNumber: true,
          products: {
            select: {
              id: true,
              price: true,
              stock: true
            }
          }
        }
      });
      
      // Calculate total sales for each farmer
      const farmersWithSales = allFarmers.map(farmer => {
        const totalSales = farmer.products.reduce((sum, product) => {
          return sum + (product.price * product.stock);
        }, 0);
        
        return {
          ...farmer,
          totalSales: totalSales,
          productCount: farmer.products.length
        };
      });
      
      // Sort by total sales
      farmersWithSales.sort((a, b) => {
        if (sortBy === 'Total Sales High-Low') {
          return b.totalSales - a.totalSales;
        } else {
          return a.totalSales - b.totalSales;
        }
      });
      
      // Apply pagination
      total = farmersWithSales.length;
      farmers = farmersWithSales.slice(skip, skip + take);
      
      // Remove products from the response (only needed for calculation)
      farmers = farmers.map(({ products, ...farmer }) => farmer);
      
    } else {
      const [farmersData, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true, name: true, email: true, role: true, phone: true, address: true, isVerified: true, 
            createdAt: true, farmName: true, bio: true, profileImage: true, isActive: true,
            farmSize: true, nationalId: true, tinNumber: true, bankName: true, accountNumber: true
          },
          orderBy,
          skip,
          take
        }),
        prisma.user.count({ where })
      ]);
      
      farmers = farmersData;
      total = totalCount;
    }
    
    res.json({
      farmers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
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
        customer: {
          select: { name: true, email: true, phone: true }
        },
        orderItems: {
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
    console.log('Sample order:', orders[0] ? JSON.stringify(orders[0], null, 2) : 'No orders');
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
    console.log('=== Fetching Transactions ===');
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Orders found for transactions:', orders.length);

    const transactions = orders.map(order => ({
      id: order.id,
      orderCode: order.orderCode,
      date: order.createdAt,
      amount: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customer: order.fullName || order.customer?.name || 'N/A',
      customerEmail: order.email || order.customer?.email || ''
    }));

    console.log('Transactions mapped:', transactions.length);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
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
    const { category, status, sortBy, search, priceMin, priceMax, farmerId, page = 1, limit = 10 } = req.query;
    
    // Build where clause for filtering
    const where = {};
    
    // **BUSINESS RULE 3: Filter products by specific farmer**
    if (farmerId) {
      where.farmerId = parseInt(farmerId);
      console.log(`Filtering products for farmer ID: ${farmerId}`);
    }
    
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (status && status !== 'All') {
      where.status = status.toLowerCase();
    }
    
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Build orderBy clause for sorting
    let orderBy = { createdAt: 'desc' };
    if (sortBy) {
      switch(sortBy) {
        case 'Newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'Oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'Price High-Low':
          orderBy = { price: 'desc' };
          break;
        case 'Price Low-High':
          orderBy = { price: 'asc' };
          break;
        case 'Name A-Z':
          orderBy = { name: 'asc' };
          break;
        case 'Name Z-A':
          orderBy = { name: 'desc' };
          break;
      }
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          farmer: {
            select: { name: true, email: true, farmName: true }
          }
        },
        orderBy,
        skip,
        take
      }),
      prisma.product.count({ where })
    ]);
    
    console.log('All products found:', products.length);
    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingProducts = async (req, res) => {
  try {
    console.log('=== Fetching Pending Products ===');
    const { category, sortBy, search, priceMin, priceMax } = req.query;
    
    // Build where clause for filtering
    const where = { status: 'pending' };
    
    if (category && category !== 'All') {
      where.category = category;
    }
    
    if (priceMin || priceMax) {
      where.price = {};
      if (priceMin) where.price.gte = parseFloat(priceMin);
      if (priceMax) where.price.lte = parseFloat(priceMax);
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Build orderBy clause for sorting
    let orderBy = { createdAt: 'desc' };
    if (sortBy) {
      switch(sortBy) {
        case 'Newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'Oldest':
          orderBy = { createdAt: 'asc' };
          break;
        case 'Price High-Low':
          orderBy = { price: 'desc' };
          break;
        case 'Price Low-High':
          orderBy = { price: 'asc' };
          break;
        case 'Name A-Z':
          orderBy = { name: 'asc' };
          break;
        case 'Name Z-A':
          orderBy = { name: 'desc' };
          break;
      }
    }
    
    const products = await prisma.product.findMany({
      where,
      include: {
        farmer: {
          select: { name: true, email: true, farmName: true }
        }
      },
      orderBy
    });
    console.log('Pending products found:', products.length);
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

// Update Product Status
exports.updateProductStatus = async (req, res) => {
  try {
    console.log('=== Updating Product Status ===');
    console.log('Product ID:', req.params.id);
    console.log('New Status:', req.body.status);

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { status: req.body.status },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            farmName: true
          }
        }
      }
    });
    console.log('Product status updated successfully');
    res.json(product);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get Single Product Detail
exports.getProductById = async (req, res) => {
  try {
    console.log('=== Fetching Product Detail ===');
    console.log('Product ID:', req.params.id);

    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        farmer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            farmName: true,
            address: true,
            profileImage: true,
            isVerified: true,
            isActive: true
          }
        }
      }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('Product detail fetched successfully');
    res.json(product);
  } catch (error) {
    console.error('Error fetching product detail:', error);
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
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transactions = orders.map(order => ({
      id: order.id,
      orderCode: order.orderCode,
      date: order.createdAt,
      amount: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      customer: order.fullName || order.customer?.name || 'N/A',
      customerEmail: order.email || order.customer?.email || ''
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
      data: { read: true }
    });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true }
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Sales Revenue Trend (Last 12 months)
exports.getSalesTrend = async (req, res) => {
  try {
    console.log('=== Fetching Sales Trend Data ===');
    
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const orders = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: twelveMonthsAgo }
      },
      select: {
        total: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });
    
    // Group by month
    const monthlyData = {};
    orders.forEach(order => {
      const monthYear = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += order.total;
    });
    
    // Format for chart
    const trendData = Object.keys(monthlyData).map(month => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: monthlyData[month]
    }));
    
    console.log('Sales trend data fetched successfully');
    res.json(trendData);
  } catch (error) {
    console.error('Error fetching sales trend:', error);
    res.status(500).json({ error: error.message });
  }
};

// Top Selling Categories
exports.getTopCategories = async (req, res) => {
  try {
    console.log('=== Fetching Top Categories Data ===');
    
    const categories = await prisma.product.groupBy({
      by: ['category'],
      where: {
        status: 'approved',
        category: { not: null }
      },
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: 10
    });
    
    const categoryData = categories.map(cat => ({
      category: cat.category || 'Uncategorized',
      count: cat._count.category
    }));
    
    console.log('Top categories data fetched successfully');
    res.json(categoryData);
  } catch (error) {
    console.error('Error fetching top categories:', error);
    res.status(500).json({ error: error.message });
  }
};

// Recent Activity Feed
exports.getRecentActivity = async (req, res) => {
  try {
    console.log('=== Fetching Recent Activity ===');
    
    const activities = [];
    
    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderCode: true,
        total: true,
        status: true,
        createdAt: true,
        customer: {
          select: {
            name: true
          }
        }
      }
    });
    
    recentOrders.forEach(order => {
      activities.push({
        id: `order-${order.id}`,
        type: 'order',
        title: `New Order #${order.orderCode}`,
        description: `Order of $${order.total.toFixed(2)} by ${order.customer?.name || 'Unknown'}`,
        status: order.status,
        timestamp: order.createdAt
      });
    });
    
    // Recent farmers
    const recentFarmers = await prisma.user.findMany({
      where: { role: 'FARMER' },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        farmName: true,
        isVerified: true,
        createdAt: true
      }
    });
    
    recentFarmers.forEach(farmer => {
      activities.push({
        id: `farmer-${farmer.id}`,
        type: 'farmer',
        title: 'New Farmer Registered',
        description: `${farmer.name} (${farmer.farmName || 'No farm name'})`,
        status: farmer.isVerified ? 'verified' : 'pending',
        timestamp: farmer.createdAt
      });
    });
    
    // Recent products
    const recentProducts = await prisma.product.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        farmer: {
          select: {
            name: true
          }
        }
      }
    });
    
    recentProducts.forEach(product => {
      activities.push({
        id: `product-${product.id}`,
        type: 'product',
        title: 'New Product Added',
        description: `${product.name} by ${product.farmer?.name || 'Unknown'}`,
        status: product.status,
        timestamp: product.createdAt
      });
    });
    
    // Sort by timestamp and take latest 10
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = activities.slice(0, 10);
    
    console.log('Recent activity fetched successfully');
    res.json(recentActivities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: error.message });
  }
};

// Top Sellers by Total Sales
exports.getTopSellers = async (req, res) => {
  try {
    console.log('=== Fetching Top Sellers ===');
    
    // Get all farmers with their products and calculate total sales
    const farmers = await prisma.user.findMany({
      where: { role: 'FARMER', isVerified: true },
      select: {
        id: true,
        name: true,
        farmName: true,
        email: true,
        profileImage: true,
        products: {
          select: {
            id: true,
            price: true,
            stock: true
          }
        }
      }
    });
    
    // Calculate total sales for each farmer
    const farmersWithSales = farmers.map(farmer => {
      const totalSales = farmer.products.reduce((sum, product) => {
        return sum + (product.price * product.stock);
      }, 0);
      
      return {
        id: farmer.id,
        name: farmer.name,
        farmName: farmer.farmName || farmer.name,
        email: farmer.email,
        profileImage: farmer.profileImage,
        totalSales: totalSales,
        productCount: farmer.products.length
      };
    });
    
    // Sort by total sales and take top 5
    const topSellers = farmersWithSales
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);
    
    res.json(topSellers);
  } catch (error) {
    console.error('Error fetching top sellers:', error);
    res.status(500).json({ error: error.message });
  }
};

// Admin Settings
exports.getAdminSettings = async (req, res) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        name: true,
        email: true,
        phone: true,
        language: true,
        timezone: true,
        emailAlerts: true,
        emailMessages: true,
        emailReports: true,
        pushAlerts: true,
        pushMessages: true,
        pushReports: true,
        smsAlerts: true,
        twoFactor: true,
        loginAlerts: true,
        sessionTimeout: true,
        lastPasswordChange: true
      }
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAdminSettings = async (req, res) => {
  try {
    const settings = req.body;
    const admin = await prisma.user.update({
      where: { id: req.user.id },
      data: settings
    });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedAdmin = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date()
      }
    });

    res.json({ message: 'Password changed successfully', user: updatedAdmin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
