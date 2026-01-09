const productService = require('../services/product.service');
const fs = require('fs');

const getProducts = async (req, res, next) => {
    try {
        const products = await productService.getAllProducts(req.query.category_id);
        res.status(200).json({
            message: "Here are the great deals!",
            "Today's Sale": products
        });
    } catch (err) {
        next(err);
    }
};

const createProduct = async (req, res, next) => {
    try {

        const imageUrlForDb = `uploads/${req.file.filename}`;
        
        const product = await productService.createProduct(req.body, req.user.id, imageUrlForDb);
        
        res.status(201).json({
            message: "Your product has been listed Successfully!",
            product_details: product
        });
    } catch (error) {
        // Cleanup image file if DB insert fails
        fs.unlinkSync(req.file.path);
        next(error);
    }
};

module.exports = { getProducts, createProduct };