const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding database...');
  
  try {
    const adminEmail = 'admin@farmconnect.com';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = await prisma.user.create({
        data: {
          name: 'Main Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('✅ Default Admin created successfully');
    } else {
      console.log('✅ Admin already exists');
    }
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
}

main()
  .catch((e) => {
    console.error('Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });