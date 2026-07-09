const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Use Prisma (PostgreSQL) — NOT Mongoose
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
      }
    });

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Note: Verification check temporarily commented out for development
    // Check if farmer is verified (for farmer-specific routes)
    // if (user.role === 'FARMER' && !user.isVerified) {
    //   return res.status(403).json({ message: 'Farmer account is not verified' });
    // }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware to check admin role
// Prisma stores roles as uppercase enums: ADMIN, FARMER, CUSTOMER
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
};

// Middleware to check farmer role
exports.farmerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'FARMER') {
    next();
  } else {
    res.status(403).json({ message: 'Farmer access required' });
  }
};

// Middleware to check customer role
exports.customerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'CUSTOMER') {
    next();
  } else {
    res.status(403).json({ message: 'Customer access required' });
  }
};
