const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const requestLogger = require('./middleware/requestLogger');
const sanitizeInput = require('./middleware/sanitize');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, uploadLimiter } = require('./middleware/rateLimiter');

const app = express();

const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) || []),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// Input sanitization
app.use(sanitizeInput);

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'User-Agent', 'DNT', 'Cache-Control', 'X-Mx-ReqToken', 'Keep-Alive', 'X-Requested-With', 'If-Modified-Since', 'X-CSRF-Token'],
  maxAge: 86400,
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



const authRouter = require('./router/authRouter');
const projectRouter = require('./router/projectRouter');
const adminRouter = require('./router/adminRouter');
const farmerRouter = require('./router/farmerRouter');
const customerRouter = require('./router/customerRouter');
const orderRouter = require('./router/orderRouter');
const productsRouter = require('./router/productsRouter');
const reviewRouter = require('./router/reviewRouter');
const paymentRouter = require('./router/paymentRouter');
const notificationRouter = require('./router/notificationRouter');

// Apply rate limiting to routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/projects', apiLimiter, projectRouter);
app.use('/api/admin', apiLimiter, adminRouter);
app.use('/api/farmer', apiLimiter, farmerRouter);
app.use('/api/customer', apiLimiter, customerRouter);
app.use('/api/orders', apiLimiter, orderRouter);
app.use('/api/products', apiLimiter, productsRouter);
app.use('/api/reviews', apiLimiter, reviewRouter);
app.use('/api/payments', apiLimiter, paymentRouter);
app.use('/api/notifications', apiLimiter, notificationRouter);

// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
