const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const rows = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'Review' ORDER BY ordinal_position`;
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
