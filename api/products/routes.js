const express = require('express');
const authMiddleware = require('../../middlewares/authentication')
const pool = require('../../db');

const router = express.Router();
router.use((req, res, next) => {
    console.log("got it")
    next();
})

async function productValidation(req, res, next) {
    const {title, description, price, condition, category_id} = req.body;
  
    if(!title || !price || !condition || !category_id) {
        return res.status(400).json({
            "message": "Invalid Request, fill up all input fields!"
        })
    }
    // I know regex, strict validation and all that stuff but not going to implement strict validation, since we can do all this type of validation through "Clien side validation".
    try {
        console.log('aaya')
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

router.post('/product', productValidation, authMiddleware, async (req, res) => {
    const {title, description, price, condition, category_id} = req.body;
    console.log('dobule')
    try {
        const result = await pool.query('INSERT INTO products(title, category_id, price, condition, user_id) VALUES($1, $2, $3, $4, $5) RETURNING *', [title, category_id, price, condition, req.user.id]);
        res.status(201).json({
            "message": "Your product has been listed Successfully!", 
            "product_details": result.rows[0]
        })
    } catch(error) {
        console.log(error.message);
        res.status(500).json({
            "message": "Internal Server Error!"
        })
    }
})

module.exports = router;