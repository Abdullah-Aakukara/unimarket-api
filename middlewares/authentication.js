const express = require('express');
const jwt = require('jsonwebtoken');

// authMiddleware (OUR BOUNCER)
function authenticateMiddleware(req, res, next) {
    const token = req.headers && req.headers['authorization'].split(' ')[1]
    
    if (!token) {
        return res.status(401).json({
            "message": "Invalid/Missing Token!"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
       console.log(err.message);
       res.status(403).json({
        "message": "You are not an authorized person!"
       })
    } 
}

module.exports = authenticateMiddleware;