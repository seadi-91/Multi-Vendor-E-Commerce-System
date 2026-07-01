const { PrismaClient } = require('@prisma/client');

// Create Prisma client with connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Connection pool configuration
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL database connected successfully via Prisma!");
    
    // Graceful shutdown
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
    
    process.on('SIGINT', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ PostgreSQL connection error:");
    console.error(error);
    process.exit(1);
  }
};

module.exports = { connectDB, prisma };
