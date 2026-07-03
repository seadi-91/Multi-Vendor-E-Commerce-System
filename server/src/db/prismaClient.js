const { PrismaClient } = require('@prisma/client');

// Create a single instance that gets reused
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

module.exports = prisma;
