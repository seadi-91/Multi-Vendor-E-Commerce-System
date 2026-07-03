const express = require('express');
const prisma = require('../db/prismaClient');
const bcrypt = require('bcrypt');

const { register, login, forgotPassword, resetPassword } = require('../controller/authController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Handle OPTIONS requests for CORS
router.options('/forgot-password', (req, res) => res.sendStatus(200));
router.options('/reset-password', (req, res) => res.sendStatus(200));

// GET /api/auth/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role: role.toUpperCase() } : {};
    const users = await prisma.user.findMany({ where: filter });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/users/:id
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/users/:id
router.get('/users/:id', protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auth/users/:id
router.put('/users/:id', protect, async (req, res) => {
  try {
    const { name, email, password, oldPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      if (!oldPassword) return res.status(400).json({ error: 'Old password is required.' });
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Old password is incorrect.' });
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: updateData
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
