const dotenv = require("dotenv");
dotenv.config();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const connectDB = require("./src/db/connectDB");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB(prisma);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:");
    console.error(error);
    process.exit(1);
  }
})();