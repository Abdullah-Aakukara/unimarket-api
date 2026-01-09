const pool = require('../db/index');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (username, email, password) => {
    // Check existing user
    const userCheck = await pool.query('SELECT * FROM app_users WHERE username = $1 OR email = $2', [username, email]);
    if (userCheck.rowCount > 0) {
        throw new Error("User or Email already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO app_users(username, email, password) VALUES($1, $2, $3) RETURNING *',
        [username, email, hashedPassword]
    );
    return result.rows[0];
};

const loginUser = async (email, password) => {
    const result = await pool.query('SELECT * FROM app_users WHERE email = $1', [email]);
    if (result.rowCount === 0) throw new Error("Invalid Credentials!");

    const user = result.rows[0];
    const isPassOk = await bcrypt.compare(password, user.password);
    
    if (!isPassOk) throw new Error("Invalid Credentials!");

    const token = jwt.sign(
        { username: user.username, id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { user, token: token }; // Return data needed for response
};

module.exports = { registerUser, loginUser };