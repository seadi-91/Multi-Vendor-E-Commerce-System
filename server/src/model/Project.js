const mongoose = require('mongoose');

const CATEGORY_ENUM = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Grains',
  'Eggs',
  'Meat',
  'Honey',
  'Others'
];

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // Cloudinary URL
  price: { type: Number, required: true, default: 0 },
  stock: { type: Number, required: true, default: 0 },
  unit: { type: String, default: 'kg' },
  category: { type: String, enum: CATEGORY_ENUM, required: true, default: 'Others' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
