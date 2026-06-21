// Script to normalize all product categories in MongoDB to match frontend values
// Usage: node scripts/normalizeCategories.js

require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

const categoryMap = [
  { match: [/fruit/i, /fruits/i], set: 'Fruits' },
  { match: [/vegetable/i, /vegetables/i], set: 'Vegetables' },
  { match: [/dairy/i], set: 'Dairy' },
  { match: [/grain/i, /grains/i], set: 'Grains' },
  { match: [/egg/i, /eggs/i], set: 'Eggs' },
  { match: [/meat/i, /meat & fish/i], set: 'Meat' },
  { match: [/honey/i], set: 'Honey' },
  { match: [/other/i, /others/i], set: 'Others' }
];

const Project = mongoose.model('Project', new mongoose.Schema({ category: String }), 'projects');

async function normalizeCategories() {
  await mongoose.connect(uri);
  let total = 0;
  for (const { match, set } of categoryMap) {
    const res = await Project.updateMany(
      { category: { $in: match.map(r => new RegExp(r, 'i')) } },
      { $set: { category: set } }
    );
    console.log(`Updated ${res.modifiedCount} documents to category '${set}'`);
    total += res.modifiedCount;
  }
  await mongoose.disconnect();
  console.log(`Done. Total updated: ${total}`);
}

normalizeCategories().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
