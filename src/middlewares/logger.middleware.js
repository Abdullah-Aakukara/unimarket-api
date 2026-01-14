const winston = require('winston');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure logs directory exists in development
if (process.env.NODE_ENV !== 'production') {
    const logsDir = path.join(__dirname, '../../logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
}

// Logger middleware config
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    ),
    transports: [
        // Use file transports only in development
        ...(process.env.NODE_ENV !== 'production' ? [
            new winston.transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error' }),
            new winston.transports.File({ filename: path.join(__dirname, '../../logs/combined.log') })
        ] : []),
        // Always use console
        new winston.transports.Console({ format: winston.format.simple() })
    ]
});

module.exports = logger;