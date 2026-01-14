const pool = require('../db');
const { getOrSetCache, client } = require('../../cache/redis.client');
const getAllProducts = async (categoryId) => {

    // unique key based categoryId
    const cacheKey = categoryId ? `products:categoryId:${categoryId}` : `products:all`;

    return await getOrSetCache(cacheKey, async () => {
        let query = 'SELECT title, description, price, condition, category_id, username as seller FROM products INNER JOIN app_users ON products.user_id = app_users.id';
        let params = [];

        if (categoryId) {
            query += ' WHERE category_id = $1';
            params.push(categoryId);
        }

        const result = await pool.query(query, params);
        return result.rows;
    }); 
};

const createProduct = async (productData, userId, imageUrl) => {
    const { title, description, category_id, price, condition } = productData;
    const result = await pool.query(
        'INSERT INTO products(title, description, category_id, price, condition, user_id, image_url) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [title, description, category_id, price, condition, userId, imageUrl]
    );

    // Invalidate cache
    await Promise.all([
        client.del('products:all'),
        client.del(`products:categoryId:${category_id}`)]
    );

    return result.rows[0];
};

module.exports = { getAllProducts, createProduct };