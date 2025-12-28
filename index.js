const express = require('express');
const cors = require('cors');
const registerRoutes = require('./api/auth/register/register.js');
const loginRoutes = require('./api/auth/login/login.js');
const productRoutes = require('./api/products/routes.js')
const rateLimiter = require('express-rate-limit')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT

// req body parser
app.use(express.json());

// rate limiter config 
const globalLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 100
})

app.use(globalLimiter);

// logger middleware 
app.use('/', (req, res, next) => {
    console.log(`Got a request for ${req.method} ${req.originalUrl}`);
    next();
})

// static middleware for Home page
app.use('/', express.static('public'))

// static middleware for serving images
app.use('/uploads', express.static('public/uploads'));

// Register Router
app.use('/api/auth', registerRoutes);

// Login Router
app.use('/api/auth', loginRoutes);

// Product Router
app.use('/api/products', productRoutes);


app.listen(PORT, () => {
    console.log("Server is running on PORT No." + PORT + ' !');
})