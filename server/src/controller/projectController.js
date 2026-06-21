const Project = require('../model/Project');
const cloudinary = require('cloudinary').v2;

// Cloudinary config (ensure you set env variables)
console.log('[DEBUG] CLOUDINARY ENV:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : undefined
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.createProject = async (req, res) => {
  try {
    console.log('[DEBUG] createProject req.body:', req.body);
    console.log('[DEBUG] createProject req.file:', req.file);
    const { name, description, price, stock, category } = req.body;
    let imageUrl = '';
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'projects'
        });
        imageUrl = result.secure_url;
        console.log('[DEBUG] Cloudinary upload result:', result);
      } catch (cloudErr) {
        console.error('[ERROR] Cloudinary upload failed:', cloudErr);
        return res.status(500).json({ error: 'Cloudinary upload failed', details: cloudErr.message });
      }
    }
    const project = new Project({
      name,
      description,
      image: imageUrl,
      price: price ? Number(price) : 0,
      stock: stock ? Number(stock) : 0,
      category: category || 'other',
      createdBy: req.user._id
    });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    console.error('[ERROR] createProject failed:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    let filter = {};
    if (req.query.category && req.query.category !== 'all') {
      // Use case-insensitive regex for flexible category matching
      filter.category = { $regex: new RegExp(`^${req.query.category}$`, 'i') };
    }
    const projects = await Project.find(filter).populate('createdBy', 'username email');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
