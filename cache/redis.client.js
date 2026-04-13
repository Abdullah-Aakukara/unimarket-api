const { createClient } = require('redis');
require('dotenv').config({ path: '../../.env' });

let client;

if (process.env.NODE_ENV !== 'development') {
    // Production: use Render's managed Redis URL
    client = createClient({
        url: process.env.REDIS_URL
    });
} else {
    // Development: use Redis Cloud credentials from .env
    client = createClient({
        username: process.env.REDIS_USER,
        password: process.env.REDIS_PASS,
        socket: {
            host: "redis-15587.c1.us-west-2-2.ec2.cloud.redislabs.com",
            port: 15587
        }
    });
}

client.on('error', err => console.error('Redis Client Error:', err.message));

// Connect and export a promise that resolves to the connected client.
// This lets callers `await redisReady` to get the actual client instance.
const redisReady = client.connect()
    .then(() => {
        console.log('✅ Redis Client connected successfully!');
        return client; // <-- resolves to the CLIENT, not the promise
    })
    .catch(err => {
        console.error('❌ Redis connection FAILED:', err.message);
        console.error('   Node Env:', process.env.NODE_ENV);
        console.error('   Make sure your Redis credentials are correct and the server is reachable.');
        return null; // graceful fallback — cache will be skipped
    });

/**
 * Helper: Get-or-Set Cache (Cache-Aside pattern)
 *
 * 1. Awaits the Redis client to be ready.
 * 2. Checks Redis for the key → cache hit: return JSON-parsed value.
 * 3. Cache miss: runs the DB callback, stores result in Redis, returns it.
 * 4. If Redis is unavailable, falls back to DB directly (no crash).
 *
 * @param {string}   key        - Redis cache key
 * @param {Function} cb         - Async callback to fetch fresh data on cache miss
 * @param {number}   expiration - TTL in seconds (default: 60s)
 */
const getOrSetCache = async (key, cb, expiration = 60) => {

    // ── Step 1: Get the Redis client (or null if unavailable) ────────────
    let redis = null;
    try {
        redis = await redisReady;
    } catch (redisErr) {
        console.error('❌ Redis not ready:', redisErr.message);
    }

    if (!redis) {
        console.warn('⚠️  Redis unavailable — fetching directly from DB (no cache).');
        // DB errors here will propagate naturally to the route error handler
        return await cb();
    }

    // ── Step 2: Check cache ──────────────────────────────────────────────
    try {
        const cached = await redis.get(key);
        if (cached != null) {
            console.log('✅ Cache HIT for key:', key);
            return JSON.parse(cached);
        }
    } catch (redisErr) {
        // Redis read failed — skip cache and go straight to DB
        console.error('❌ Redis GET error:', redisErr.message);
        return await cb(); // DB errors propagate up
    }

    // ── Step 3: Cache MISS — fetch from DB ──────────────────────────────
    // NOTE: Any DB error thrown by cb() propagates directly to the caller.
    //       It is NOT caught here — that's intentional so errors are visible.
    console.log('🔄 Cache MISS for key:', key, '— querying DB...');
    const freshData = await cb();

    // ── Step 4: Store result in Redis ────────────────────────────────────
    try {
        const result = await redis.set(key, JSON.stringify(freshData), { EX: expiration });
        console.log('💾 Cached result. Redis SET result:', result);
    } catch (redisErr) {
        // Failed to cache — still return the DB data, just won't be cached
        console.error('❌ Redis SET error:', redisErr.message);
    }

    return freshData;
};

module.exports = { redisReady, getOrSetCache };
