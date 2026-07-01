const connectDB = async (prisma) => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL database connected successfully via Prisma!");
  } catch (error) {
    console.error("❌ PostgreSQL connection error:");
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;     