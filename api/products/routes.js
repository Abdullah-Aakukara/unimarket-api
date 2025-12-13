const express = require('express');
const authMiddleware = require('../../middlewares/authentication')
const pool = require('../../db');
const multer = require('multer');
const fs = require('fs');
const path = require('path');


const router = express.Router();


const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join (process.cwd(),'public', 'upload');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, {recursive: true});
        }

        cb(null, uploadPath)
    }, 
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({storage: diskStorage});

async function productValidation(req, res, next) {
    const {title, description, price, condition, category_id} = req.body;
  
    if(!title || !price || !condition || !category_id || !description) {
        return res.status(400).json({
            "message": "Invalid Request, fill up all input fields!"
        })
    }

    if(!req.file) {
        return res.status(400).json({
            "message": "Image not provided, please upload a good Image!"
        })
    }

    
    // I know regex, strict validation and all that stuff but not going to implement strict validation, since we can do all this type of validation through "Clien side validation".
    try {
       
        const result = await pool.query('SELECT id FROM categories WHERE id = $1',[category_id]);
        if(!result.rowCount) {
            return res.status(400).json({
                "message": "Invalid category_id!"
            })
        }
    } catch(err) {
        return res.status(500).json({
            "message": "Internal server!"
        })
    }
    next();
}
// Posting a new Product
router.post('/', upload.single('productImage'), productValidation, authMiddleware, async (req, res) => {
    
    
    const {title, description, price, condition, category_id} = req.body;
    const imageUrlForDb = `${req.file.path}`;
    
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

// Viewing all Products along with query string
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

module.exports = router;