const {Pool} = require('pg');
require('dotenv').config();

const dbUser = process.env.DBUSER;
const dbPass = process.env.DBPASS;
const host = process.env.DBHOST;
const pool = new Pool({
    user: dbUser, 
    host: host,
    password: dbPass,
    database: "unimarket", 
    port: 5432
});





module.exports = pool;