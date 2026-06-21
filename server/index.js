const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/db/connectDB');

dotenv.config();

const app = require('./src/app');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
	app.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});
