const { RateLimiterRedis } = require('rate-limiter-flexible');
const  rateLimit  = require('express-rate-limit');
const  {RedisStore} = require('rate-limit-redis');
const redis = require('../database/redis');


const createRedisLimiter = new RateLimiterRedis({
    storeClient: redis,
    points: 1000, // Number of requests
    duration: 1, // Per second
    blockDuration: 10, // Block for 900 seconds if consumed more than points,
    keyPrefix: 'middleware', // Prefix for Redis keys
});


const createRateLimiter = (maxRequests,time) => {
    return rateLimit({
        windowMs: time, 
        limit: maxRequests, 
        message:"Too many requests,please try again later",
        standardHeaders: true, 
        legacyHeaders: false, 
        ipv6Subnet: 56, 
        store:new RedisStore({
            sendCommand: (...args) => redis.call(...args),
        }), 
    })
}

module.exports = { createRedisLimiter, createRateLimiter };