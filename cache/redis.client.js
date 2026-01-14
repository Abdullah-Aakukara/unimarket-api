const {createClient} = require('redis');
require('dotenv').config({path:'../../.env'});

let client;

if (process.env.NODE_ENV !== 'development') { // for production using render's managed service
    client = createClient({
        url : process.env.REDIS_URL
    });
} else {  // for development using redis cloud
    client = createClient({
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASS,
        socket: {
            host: 'redis-11726.crce199.us-west-2-2.ec2.cloud.redislabs.com',
            port: 11726
        }
    });
}

client.on('error', err => console.log('Redis Client Error', err));

// Connect immediately
(async () => {
    if (!client.isOpen) {
        await client.connect();
    }
})();

/**
 * Helper: Get or Set Cache
 * 1. Checks Redis for the key.
 * 2. If hit: returns cached data.
 * 3. If miss: runs the callback (db query), saves result to Redis, and returns it.
 * * @param {string} key - Redis key
 * @param {Function} cb - Async callback function to fetch data if cache miss
 * @param {number} expiration - Expiration in seconds (default 60 = 1 min)
 */
const getOrSetCache = async (key, cb, expiration = 60) => {
    try {
        const data = await client.get(key);
        if (data != null) {
            return JSON.parse(data);
    }

    // console.log(`Cache Miss for key:${key}`);
    const freshData = await cb();
        
    // Save to Redis with Expiration 
    await client.set(key, JSON.stringify(freshData), {
            EX: expiration
    });
        
    return freshData;
    
    } catch (error) {
        console.error('Redis Error:', error);
        // Fallback: If Redis fails, just return fresh data directly
        return await cb();
    }
};

module.exports = {
    client,
    getOrSetCache
};
