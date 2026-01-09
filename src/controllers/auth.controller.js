const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const user = await authService.registerUser(username, email, password);
        res.status(201).json({
            message: `Welcome ${user.username}! Your Account has been Successfully Created!`
        });
    } catch (error) {
        // Simple error handling for now (you can improve this later)
        res.status(409).json({ message: error.message });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser(email, password);
        res.status(200).json({
            message: `Welcome back ${user.username}!`,
            token: token
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

module.exports = { register, login };