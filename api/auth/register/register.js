const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../../../database');
const validationMiddleware = require('../../../middlewares/validation');

const router = express.Router();

router.post('/register', validationMiddleware, async (req, res) => {

    const {username, email, password} = req.body;

    try {
        const result = await pool.query('SELECT * FROM app_users WHERE username = $1', [username]);
        if (result.rowCount === 1) {
            return res.status(409).json({
                message: "User already exists!"
            })
        }

        const isEmailValid = await pool.query('SELECT email FROM app_users WHERE email = $1', [email]); // Fetched only email to reduce the load time. 
        if (isEmailValid.rowCount === 1) {
            return res.status(409).json({
                message: "Email already exists, try another one!"
            })
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query('INSERT INTO app_users(username, email, password) VALUES($1, $2, $3) RETURNING *',[username, email, hashedPassword]);
            res.status(201).json({
            message: `Welcome ${newUser.rows[0].username}! Your Account has been Successfully Created!`
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Internal Server Error!"
        })
    }
})


module.exports = router;