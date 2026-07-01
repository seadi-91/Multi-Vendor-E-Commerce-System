require('dotenv').config();
const app = require('./src/app');
const { PrismaClient } = require('@prisma/client');
const connectDB = require('./src/db/connectDB');

const PORT = process.env.PORT || 5000;

// Initialize Prisma
const prisma = new PrismaClient();

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Connect to database and start server
connectDB(prisma)
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Keep server alive
    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });