const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool  = require('../../../db');
const validationMiddleware = require('../../../validation');
require('dotenv').config();

const app = express();
app.use(express.json());
const router = express.Router();



/*I AM NOT GOING TO APPLY STRICT VALIDATION like -
email regex, or checking typeof username etc. because -
we can do this type of things very efficiently at client side validation (Front-end).*/


// loginAuth middleware
const loginAuth = async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const result =  await pool.query('SELECT * FROM app_users WHERE email = $1', [email])
        if (!result.rowCount) {
            return res.status(401).json({
            message: "Invalid Credentials!"
            })
        }
        const hashedPassword = result.rows[0].password;
        const isPassOk = await bcrypt.compare(password, hashedPassword);
    
        if (!isPassOk) {
            return res.status(401).json({
            message: "Invalid Credentials!"
            })
        }

        req.user = result.rows[0];
        next();
    } catch(error) {
        console.log(error.message);
        res.json({
            "message": "Internal Server Error, try again!"
        })
    } 
}


// login
router.post('/login', validationMiddleware, loginAuth, (req, res) => {       
    const payload = {
        username: req.user.username, 
        id: req.user.id,
        email: req.user.email
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h'
    })

    res.status(200).json({
        message: `Welcome back ${req.user.username}!`, 
        token: token
    })
})


module.exports = router;