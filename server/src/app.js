const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
	origin: [
		'http://localhost:5173',
		'http://localhost:5174',
		'http://localhost:5175'
	],
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Agent', 'DNT', 'Cache-Control', 'X-Mx-ReqToken', 'Keep-Alive', 'X-Requested-With', 'If-Modified-Since', 'X-CSRF-Token']
}));
app.use(express.json());



const authRouter = require('./router/authRouter');
const projectRouter = require('./router/projectRouter');
const adminRouter = require('./router/adminRouter');
const farmerRouter = require('./router/farmerRouter');

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/admin', adminRouter);
app.use('/api/farmer', farmerRouter);

// Health check
app.get('/', (req, res) => {
	res.send('API is running...');
});

// Error handling middleware (basic)
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: 'Server Error' });
});

module.exports = app;
