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
  category: { type: String, enum: CATEGORY_ENUM, required: true, default: 'Others' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
