const User = require('../model/User');
const Project = require('../model/Project');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const totalProducts = await Project.countDocuments({ farmerId });
    const pendingOrders = 5; // Placeholder - implement Order model
    const completedOrders = 12; // Placeholder - implement Order model
    const totalEarnings = 45000; // Placeholder - implement Order model
    const monthlyRevenue = 8500; // Placeholder - implement Order model

    res.json({
      totalProducts,
      pendingOrders,
      completedOrders,
      totalEarnings,
      monthlyRevenue,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Product Management
exports.getFarmerProducts = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const products = await Project.find({ farmerId })
      .sort({ createTime: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { name, description, price, stock, category, badges } = req.body;
    
    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
      imageUrl = result.secure_url;
    }

    const product = await Project.create({
      name,
      description,
      price,
      stock,
      category,
      badges: badges ? badges.split(',') : [],
      image: imageUrl,
      farmerId,
      status: 'pending',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category, badges } = req.body;
    let update = { name, description, price, stock, category };
    
    if (badges) {
      update.badges = badges.split(',');
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
      update.image = result.secure_url;
    }

    const product = await Project.findOneAndUpdate(
      { _id: req.params.id, farmerId: req.user.id },
      update,
      { new: true }
    );

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Project.findOneAndDelete({
      _id: req.params.id,
      farmerId: req.user.id,
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Order Management
exports.getFarmerOrders = async (req, res) => {
  try {
    // Placeholder - implement Order model
    res.json({
      message: 'Order endpoint - implement Order model for full functionality',
      orders: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingOrders = async (req, res) => {
  try {
    // Placeholder - implement Order model
    res.json({
      message: 'Pending orders endpoint - implement Order model for full functionality',
      orders: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCompletedOrders = async (req, res) => {
  try {
    // Placeholder - implement Order model
    res.json({
      message: 'Completed orders endpoint - implement Order model for full functionality',
      orders: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeOrder = async (req, res) => {
  try {
    // Placeholder - implement Order model
    res.json({
      message: 'Complete order endpoint - implement Order model for full functionality'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Earnings
exports.getEarnings = async (req, res) => {
  try {
    // Placeholder - implement Order model
    res.json({
      message: 'Earnings endpoint - implement Order model for full functionality',
      totalEarnings: 0,
      availableForWithdrawal: 0,
      pendingWithdrawals: 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEarningsReports = async (req, res) => {
  try {
    // Placeholder - implement Order model
    res.json({
      message: 'Earnings reports endpoint - implement Order model for full functionality',
      reports: []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;
    // Placeholder - implement Withdrawal model
    res.json({
      message: 'Withdrawal request endpoint - implement Withdrawal model for full functionality',
      amount,
      status: 'pending',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Analytics
exports.getSalesAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const products = await Project.find({ farmerId, status: 'approved' });
    
    // Placeholder analytics
    res.json({
      totalSales: 0,
      averageOrderValue: 0,
      topSellingProducts: products.slice(0, 5),
      salesByMonth: [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTrafficAnalytics = async (req, res) => {
  try {
    // Placeholder - implement analytics tracking
    res.json({
      message: 'Traffic analytics endpoint - implement analytics tracking',
      pageViews: 0,
      uniqueVisitors: 0,
      trafficSources: [],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPerformanceAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const products = await Project.find({ farmerId });
    
    res.json({
      totalProducts: products.length,
      approvedProducts: products.filter(p => p.status === 'approved').length,
      pendingProducts: products.filter(p => p.status === 'pending').length,
      averageRating: 4.5, // Placeholder - implement review system
      responseTime: '2 hours', // Placeholder
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Farmer Profile
exports.getFarmerProfile = async (req, res) => {
  try {
    const farmer = await User.findById(req.user.id).select('-password');
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFarmerProfile = async (req, res) => {
  try {
    const { name, email, phone, location, farmName, farmSize, bio } = req.body;
    const farmer = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, location, farmName, farmSize, bio },
      { new: true }
    ).select('-password');
    
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Farmer Settings
exports.getFarmerSettings = async (req, res) => {
  try {
    const farmer = await User.findById(req.user.id).select('-password');
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    
    res.json({
      email: farmer.email,
      phone: farmer.phone,
      language: farmer.language || 'English',
      timezone: farmer.timezone || 'Africa/Addis_Ababa',
      bankName: farmer.bankName,
      accountNumber: farmer.accountNumber,
      paymentMethod: farmer.paymentMethod,
      twoFactor: farmer.twoFactor || false,
      loginAlerts: farmer.loginAlerts || true,
      businessLicense: farmer.businessLicense,
      taxId: farmer.taxId,
      vatRegistered: farmer.vatRegistered || false,
      vatNumber: farmer.vatNumber,
      insuranceProvider: farmer.insuranceProvider,
      insurancePolicy: farmer.insurancePolicy,
      insuranceExpiry: farmer.insuranceExpiry,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFarmerSettings = async (req, res) => {
  try {
    const {
      email, phone, language, timezone,
      bankName, accountNumber, paymentMethod,
      twoFactor, loginAlerts,
      businessLicense, taxId, vatRegistered, vatNumber,
      insuranceProvider, insurancePolicy, insuranceExpiry,
    } = req.body;

    const farmer = await User.findByIdAndUpdate(
      req.user.id,
      {
        email, phone, language, timezone,
        bankName, accountNumber, paymentMethod,
        twoFactor, loginAlerts,
        businessLicense, taxId, vatRegistered, vatNumber,
        insuranceProvider, insurancePolicy, insuranceExpiry,
      },
      { new: true }
    ).select('-password');

    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const farmer = await User.findById(req.user.id);

    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

    const isMatch = await bcrypt.compare(currentPassword, farmer.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    farmer.password = await bcrypt.hash(newPassword, 10);
    await farmer.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
