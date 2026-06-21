const express = require('express');
const router = express.Router();
const projectController = require('../controller/projectController');
const auth = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Update project by id
router.put('/:id', auth.protect, upload.single('image'), async (req, res) => {
	try {
		const { name, description, price, stock } = req.body;
		let update = { name, description, price, stock };
		if (req.file) {
			const cloudinary = require('cloudinary').v2;
			const result = await cloudinary.uploader.upload(req.file.path, { folder: 'projects' });
			update.image = result.secure_url;
		}
		const updated = await require('../model/Project').findByIdAndUpdate(
			req.params.id,
			{ $set: update },
			{ new: true }
		);
		if (!updated) return res.status(404).json({ error: 'Project not found' });
		res.json(updated);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Create project (with image upload)
router.post('/', auth.protect, upload.single('image'), projectController.createProject);

// Get all projects
router.get('/', projectController.getProjects);


// Delete project by id
router.delete('/:id', auth.protect, async (req, res) => {
	try {
		const deleted = await require('../model/Project').findByIdAndDelete(req.params.id);
		if (!deleted) return res.status(404).json({ error: 'Project not found' });
		res.json({ message: 'Project deleted' });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

module.exports = router;
