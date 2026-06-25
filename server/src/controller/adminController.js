const User = require('../model/User');
const Project = require('../model/Project');

// Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalProducts = await Project.countDocuments();
    const pendingFarmers = await User.countDocuments({ role: 'farmer', isVerified: false });
    const pendingProducts = await Project.countDocuments({ status: 'pending' });
    const activeUsers = await User.countDocuments({ role: 'customer', isActive: true });

    res.json({
      totalUsers,
      totalFarmers,
      totalProducts,
      pendingFarmers,
      pendingProducts,
      activeUsers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer', isActive: true })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSuspendedUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer', isActive: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Farmer Management
exports.getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer', isVerified: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVerifiedFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer', isVerified: true })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyFarmer = async (req, res) => {
  try {
    const farmer = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectFarmer = async (req, res) => {
  try {
    const farmer = await User.findByIdAndDelete(req.params.id);
    if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
    res.json({ message: 'Farmer rejected and deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Product Management
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Project.find()
      .populate('farmerId', 'name email')
      .sort({ createTime: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingProducts = async (req, res) => {
  try {
    const products = await Project.find({ status: 'pending' })
      .populate('farmerId', 'name email')
      .sort({ createTime: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const product = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    ).populate('farmerId', 'name email');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectProduct = async (req, res) => {
  try {
    const product = await Project.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    ).populate('farmerId', 'name email');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Project.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Analytics & Reports
exports.getReports = async (req, res) => {
  try {
    const totalRevenue = await Project.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const productsByCategory = await Project.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const monthlySales = await Project.aggregate([
      {
        $match: {
          status: 'approved',
          createTime: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: { month: { $month: '$createTime' }, year: { $year: '$createTime' } },
          count: { $sum: 1 },
          revenue: { $sum: '$price' }
        }
      }
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      productsByCategory,
      monthlySales,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    // This would typically come from an Order model
    // For now, returning placeholder data
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
    const admin = await User.findById(req.user.id).select('-password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, phone, location } = req.body;
    const admin = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, location },
      { new: true }
    ).select('-password');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
