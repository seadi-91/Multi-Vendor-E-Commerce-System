// Test script to reproduce the 500 error
const { prisma } = require('./src/db/connectDB');

async function testProductCreate() {
  console.log('=== Testing Product Creation ===');
  
  try {
    // Simulate the data that would come from the frontend
    const testData = {
      name: 'Test Product',
      description: 'Test description',
      price: 100,
      stock: 50,
      totalStock: 50,
      minOrderQuantity: 1,
      unit: 'kg',
      category: 'Vegetables',
      brand: null,
      sku: null,
      discountPrice: null,
      isOrganic: false,
      harvestDate: null,
      expiryDate: null,
      badges: [],
      tags: [],
      image: '',
      farmerId: 1, // Replace with an actual farmer ID from your database
      status: 'pending',
    };

    console.log('Test data:', JSON.stringify(testData, null, 2));

    // Try to create the product
    const product = await prisma.product.create({
      data: testData
    });

    console.log('✅ Product created successfully:', product);
  } catch (error) {
    console.error('❌ ERROR:', error);
    console.error('Error code:', error.code);
    console.error('Error meta:', error.meta);
    console.error('Error message:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testProductCreate();
