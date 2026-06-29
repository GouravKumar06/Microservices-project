const  rateLimit  = require('express-rate-limit');
const  {RedisStore} = require('rate-limit-redis');
const redis = require('../database/redis');

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

module.exports = createRateLimiter;