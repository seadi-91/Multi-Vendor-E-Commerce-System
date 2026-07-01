const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  const adminEmail = 'admin@farmconnect.com';

  // 1. መጀመሪያ ይህ ኢሜይል ዳታቤዙ ውስጥ መኖሩን ማረጋገጥ
  const existingAdmin = await prisma.customer.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10); // ፓስወርድ admin123

    // 2. ከሌለ አዲስ Admin መፍጠር
    const admin = await prisma.customer.create({
      data: {
        name: 'Main Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Default Admin created successfully:', admin);
  } else {
    console.log('Admin already exists in the database. Skipping...');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });