require("dotenv").config();
const jwt = require("jsonwebtoken");
const token = jwt.sign({ id: 2 }, process.env.JWT_SECRET, { expiresIn: '1d' });
console.log(token);
