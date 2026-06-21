// Usage: node scripts/createAdmin.js
// This script will hash a password and print a ready-to-insert admin user object for MongoDB.

const bcrypt = require('bcrypt');

async function createAdmin() {
  const password = '@moba2001'; // Change to your desired admin password
  const hash = await bcrypt.hash(password, 10);


  const adminUser = {
    name: 'Abubeker',
    email: 'abukeryimer979@gmail.com',
    password: hash,
    role: 'admin' // This field is required for admin access
  };

  console.log('Copy and insert this object into your MongoDB users collection:');
  console.log(JSON.stringify(adminUser, null, 2));
}

createAdmin();
