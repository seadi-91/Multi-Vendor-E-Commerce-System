const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const existingPhone = await prisma.user.findFirst({
        where: { phone: "12345678" }
    });
    console.log("existingPhone ok");
    
    const user = await prisma.user.create({
      data: {
        name: "Test Farmer 2",
        email: "newfarmer2x@example.com",
        password: "password123",
        role: "FARMER",
        address: "123 Farm Lane",
        phone: "12345678"
      }
    });
    console.log("user create ok", user);
  } catch (err) {
    console.error("Test error:", err);
  }
}
test();
