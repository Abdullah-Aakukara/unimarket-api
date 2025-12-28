const {Pool} = require('pg');
require('dotenv').config();

// local DB Config
const dbConfig = {
    user: process.env.DBUSER, 
    host: process.env.DBHOST,
    password: process.env.DBPASS,
    database: process.env.DBNAME, 
    port: 5432
}
if(!process.env.DATABASE_URL) {
    const pool = new Pool(dbConfig);
    module.exports = pool;
} else { 
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL, 
        ssl: {
            rejectUnauthorized: false
        }
    });
    module.exports = pool; 
}


