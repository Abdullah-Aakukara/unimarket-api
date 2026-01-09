const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validationMiddleware = require('../middlewares/validation.middleware');

router.post('/register', validationMiddleware, authController.register);
router.post('/login', validationMiddleware, authController.login);

module.exports = router;