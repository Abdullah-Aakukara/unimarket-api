const pool = require('../db/index')

// Product Validation
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
    
    try {
       
        const result = await pool.query('SELECT id FROM categories WHERE id = $1',[category_id]);
        if(!result.rowCount) {
            return res.status(400).json({
                "message": "Invalid category_id!"
            })
        }
    } catch(err) {
        next(err)
    }
    
    next();
}

module.exports = productValidation;