
// validation middleware 
const validationMiddleware = (req, res, next) => {
    const {username, email, password} = req.body;

    // specifically for /register because username is required for registration
    if (req.originalUrl === '/api/auth/register') {
        if(!username || username.trim() === '') {
            return res.status(400).json({
                message: 'Username is required!'
            })
        }  
    }
    // common for both routes
    if (!email || !password) {
        res.status(400).json({
            message: 'Please enter valid Email and Password!'
        })
    }
    next();
}

module.exports = validationMiddleware;
