require('dotenv').config(); // Trigger nodemon restart
const app = require('./src/app');
const config = require('./src/config');
const { PrismaClient } = require('@prisma/client');
const { connectDB } = require('./src/db/connectDB');

const PORT = config.PORT || 5000;

// Initialize Prisma handled in connectDB

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
connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`📊 Environment: ${config.NODE_ENV}`);
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