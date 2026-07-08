const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCategories() {
  try {
    console.log('Starting category seed...');

    // Get all distinct category names from existing products
    const products = await prisma.product.findMany({
      select: { category: true },
      where: { category: { not: null } },
      distinct: ['category']
    });

    console.log('Found distinct categories from products:', products.map(p => p.category));

    // Create categories for each distinct category name
    const categories = [];
    for (const product of products) {
      const categoryName = product.category;
      if (!categoryName) continue;

      const categoryKey = categoryName.toLowerCase().replace(/\s+/g, '-');

      // Check if category already exists
      const existing = await prisma.category.findUnique({
        where: { categoryKey }
      });

      if (!existing) {
        const category = await prisma.category.create({
          data: {
            name: categoryName,
            categoryKey: categoryKey,
            description: `${categoryName} products`,
            image: null
          }
        });
        categories.push(category);
        console.log(`Created category: ${category.name} (ID: ${category.id})`);
      } else {
        categories.push(existing);
        console.log(`Category already exists: ${existing.name} (ID: ${existing.id})`);
      }
    }

    console.log('Categories created/fetched:', categories.map(c => ({ id: c.id, name: c.name, categoryKey: c.categoryKey })));

    // Update all products to link to their category
    console.log('Updating products with categoryId...');
    let updatedCount = 0;

    for (const category of categories) {
      const productsToUpdate = await prisma.product.findMany({
        where: {
          category: category.name,
          categoryId: null
        }
      });

      if (productsToUpdate.length > 0) {
        await prisma.product.updateMany({
          where: {
            category: category.name,
            categoryId: null
          },
          data: {
            categoryId: category.id
          }
        });
        console.log(`Updated ${productsToUpdate.length} products for category ${category.name} (ID: ${category.id})`);
        updatedCount += productsToUpdate.length;
      }
    }

    console.log(`Total products updated: ${updatedCount}`);
    console.log('Category seed completed successfully!');

  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
