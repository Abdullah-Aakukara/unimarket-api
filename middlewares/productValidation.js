const pool = require('../database')

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

    
    // I know regex, strict validation and all that stuff but not going to implement strict validation, since we can do all this type of validation through "Clien side validation".
    try {
       
        const result = await pool.query('SELECT id FROM categories WHERE id = $1',[category_id]);
        if(!result.rowCount) {
            return res.status(400).json({
                "message": "Invalid category_id!"
            })
        }
    } catch(err) {
        console.log(err.message)
        return res.status(500).json({
            "message": "Internal server!"
        })
    }
    next();
}

module.exports = productValidation;