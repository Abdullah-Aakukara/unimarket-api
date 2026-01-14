// App Configurations
const express = require('express');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');
const logger = require('./middlewares/logger.middleware');

// Import Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');

const app = express();

// Global Middlewares
app.use(express.json());
app.use(cors());

// Global Rate Limiter
const globalLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100
});
app.use(globalLimiter);

// Request Logger
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});

// Static Files
app.use('/', express.static('public')); // For index.html
app.use('/uploads', express.static('public/uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Error Handling
app.use((err, req, res, next) => {
    logger.error(`${err.stack} \n Request: ${req.method} ${req.originalUrl} \n IP: ${req.ip} \n`);
    res.status(500).json({ message: "Internal Server Error!" });
});

module.exports = app;