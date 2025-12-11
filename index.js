const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('./db.js');
const registerRoutes = require('./api/auth/register/register.js');
const loginRoutes = require('./api/auth/login/login.js');
const productRoutes = require('./api/products/routes.js')
const validationMiddleware = require('./validation.js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = 3000

// req body parser
app.use(express.json());

// logger middleware
app.use('/', (req, res, next) => {
    console.log(`Got a request for ${req.method} ${req.originalUrl}`);
    next();
})




app.use('/api/auth', registerRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api/products', productRoutes);


app.listen(PORT, () => {
    console.log("Server is running on PORT No." + PORT + ' !');
})

