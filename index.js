const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('./db.js');
const registerRoutes = require('./api/auth/register/register.js');
const loginRoutes = require('./api/auth/login/login.js');
const validationMiddleware = require('./validation.js');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000

// req body parser
app.use(express.json());

app.use('/api/auth', registerRoutes);
app.use('/api/auth', loginRoutes);

// logger middleware
app.use('/', (req, res, next) => {
    console.log(`Got a request for ${req.method} ${req.originalUrl}`);
    next();
})

app.listen(PORT, () => {
    console.log("Server is running on PORT No." + PORT + ' !');
})

