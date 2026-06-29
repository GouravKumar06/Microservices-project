const proxy = require('express-http-proxy');
const logger = require('../utils/logger');

const proxyMiddleware = (target, options) => {
    return proxy(target, { 
        ...options,
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            proxyReqOpts.headers['content-type'] = 'application/json';
            return proxyReqOpts;
        },
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            logger.info(`Proxying request to ${target} with url = ${userReq.originalUrl}`);
            return proxyResData;
        }
    });
}

module.exports = proxyMiddleware;