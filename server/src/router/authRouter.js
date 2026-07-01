const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { register, login, forgotPassword, resetPassword } = require('../controller/authController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Public register route
router.post('/register', register);
// Login route for all roles
router.post('/login', login);
// GET /api/users?role=farmer or /api/users?role=customer
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await prisma.customer.findMany({ where: filter });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE /api/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await prisma.customer.delete({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get user by ID (profile fetch)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await prisma.customer.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, address: user.address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user by ID (profile update, with password change support)
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, password, oldPassword } = req.body;
    const user = await prisma.customer.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ error: 'Old password is required.' });
      }
      const bcrypt = require('bcrypt');
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Old password is incorrect.' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    const updatedUser = await prisma.customer.update({
      where: { id: parseInt(req.params.id) },
      data: updateData
    });
    res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, address: updatedUser.address });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Handle OPTIONS requests for CORS
router.options('/forgot-password', (req, res) => {
  res.sendStatus(200);
});
router.options('/reset-password', (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
