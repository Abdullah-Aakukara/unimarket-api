const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const productValidation = require('../middlewares/productValidation.middleware'); // Assuming you renamed the file
const rateLimiter = require('express-rate-limit');

const postLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: "Too many products created, please try again after One Hour."
});

router.get('/', productController.getProducts);

router.post('/', 
    postLimiter, 
    authMiddleware, 
    upload.single('productImage'), 
    productValidation, 
    productController.createProduct
);

module.exports = router;