const pool = require('../db');

const getAllProducts = async (categoryId) => {
    let query = 'SELECT title, description, drice, condition, category_id, username as seller FROM products INNER JOIN app_users ON products.user_id = app_users.id';
    let params = [];

    if (categoryId) {
        query += ' WHERE category_id = $1';
        params.push(categoryId);
    }

    const result = await pool.query(query, params);
    return result.rows;
};

const createProduct = async (productData, userId, imageUrl) => {
    const { title, description, category_id,Hvprice, condition } = productData;
    const result = await pool.query(
        'INSERT INTO products(title, description, category_id, price, condition, user_id, image_url) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [title, description, category_id, price, condition, userId, imageUrl]
    );
    return result.rows[0];
};

module.exports = { getAllProducts, createProduct };