const pool = require('../db');
const { getOrSetCache, redisReady } = require('../../cache/redis.client');

const getAllProducts = async (categoryId) => {

    // Unique cache key based on optional categoryId filter
    const cacheKey = categoryId ? `products:categoryId:${categoryId}` : `products:all`;

    return await getOrSetCache(cacheKey, async () => {
        let query = 'SELECT products.image_url, title, description, price, condition, category_id, username as seller FROM products INNER JOIN app_users ON products.user_id = app_users.id';
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

    // Invalidate cache after a write — await the Promise to get the actual client
    try {
        const redis = await redisReady;
        if (redis) {
            await Promise.all([
                redis.del('products:all'),
                redis.del(`products:categoryId:${category_id}`)
            ]);
        }
    } catch (err) {
        // Cache invalidation failure should NOT break the product creation
        console.error('Cache invalidation error:', err.message);
    }

    return result.rows[0];
};

module.exports = { getAllProducts, createProduct };