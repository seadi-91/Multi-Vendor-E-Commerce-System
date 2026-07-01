const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// GET /api/projects — used by customer product page
router.get('/', async (req, res) => {
  try {
    console.log('=== Fetching Products for Home Page ===');
    const { category } = req.query;
    console.log('Category filter:', category);

    const where = { status: 'approved' };
    if (category && category !== 'all') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    console.log('Query where clause:', where);

    const products = await prisma.product.findMany({
      where,
      include: {
        farmer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('Products found:', products.length);
    console.log('Products:', products);

    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/projects — legacy create (redirects to farmer product endpoint)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, category, unit } = req.body;
    const farmerId = req.user.id;

    let imageUrl = '';
    if (req.file) {
      const cloudinary = require('cloudinary').v2;
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
      imageUrl = result.secure_url;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price) || 0,
        stock: Number(stock) || 0,
        unit: unit || 'kg',
        category,
        image: imageUrl,
        farmerId,
        status: 'pending',
      }
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, stock, unit } = req.body;
    const updateData = { name, description, price: Number(price) || 0, stock: Number(stock) || 0, unit: unit || 'kg' };

    if (req.file) {
      const cloudinary = require('cloudinary').v2;
      const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
      updateData.image = result.secure_url;
    }

    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
