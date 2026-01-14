// src/db/index.js
const { Pool } = require('pg');
require('dotenv').config({path:'../../.env'});

const dbConfig = {
    user: process.env.DB_USER || process.env.DBUSER, // Handle naming variations
    host: process.env.DB_HOST || process.env.DBHOST,
    password: process.env.DB_PASSWORD || process.env.DBPASS,
    database: process.env.DB_NAME || process.env.DBNAME,
    port: process.env.DB_PORT || 5432
};

// Check for DATABASE_URL (often used in production/Render)
const connectionString = process.env.DATABASE_URL;

const pool = new Pool(
    connectionString ? { connectionString, ssl: { rejectUnauthorized: false } } : dbConfig
);

module.exports = pool;