const express = require('express');
const authMiddleware = require('../../middlewares/authentication')
const productValidation = require('../../middlewares/productValidation')
const pool = require('../../database');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const rateLimiter = require('express-rate-limit');

const router = express.Router();

// rate limit config for post route
const postLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5, 
    message: "Too many products created from this Account, please try again after One Hour."
})

// file upload config (multer)
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join (process.cwd(),'public', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, {recursive: true});
        }

        cb(null, uploadPath)
    }, 
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    }
})

const upload = multer({storage: diskStorage});

// View all Products along with query string
router.get('/', async (req, res) => {
    try {
        if (!req.query.category_id) {
            const result = await pool.query('SELECT title, description, price, condition, category_id, username as seller FROM products INNER JOIN app_users ON products.user_id = app_users.id')
            return res.status(200).json({
                "message": "Welcome Student! Here's the great deals you should grab now!",
                "Today\'s Sale": result.rows
            })
        }

        const result = await pool.query('SELECT title, description, price, condition, username as seller FROM products INNER JOIN app_users ON products.user_id = app_users.id WHERE category_id = $1', [req.query.category_id]);
        
        res.status(200).json({
            "message": `Welcome Student! Here's the great deals for items that falls into Category: ${req.query.category_id} !`,
            "Today\'s Sale": result.rows
        })
        
    } catch(err) {
        console.log(err);
        res.status(500).json("Database error! Try again.")
    }
})

// Post a new Product
router.post('/', postLimiter, upload.single('productImage'), productValidation, authMiddleware, async (req, res) => {
    
    
    const {title, description, price, condition, category_id} = req.body;
    const imageUrlForDb = `uploads/${req.file.filename}`;
    
    
    try {
        const result = await pool.query('INSERT INTO products(title, description, category_id, price, condition, user_id, image_url) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *', [title, description, category_id, price, condition, req.user.id, imageUrlForDb]);
        res.status(201).json({
            "message": "Your product has been listed Successfully!", 
            "product_details": result.rows[0]
        })

    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            "message": "Internal Server Error!"
        })
        fs.unlinkSync(req.file.path);
    }
})

module.exports = router