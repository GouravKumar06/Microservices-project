require('dotenv').config();
const express = require('express');
const configureCors = require('./config/cors.config');
const helmet = require('helmet');
const createRateLimiter = require('./middleware/rateLimiter');
const isAuthenticated = require('./middleware/authMiddleware');
const proxy = require('express-http-proxy');
const logger = require('./utils/logger');
// const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT;


// proxy options for identity routes
const identityProxyOptions = { 
    proxyReqPathResolver: (req) => {

        const path = req.originalUrl.replace(
            "/v1/api/auth",
            `/${process.env.AUTH_VERSION}/api/auth`
        );

        console.log("Proxy Path:", path);

        return path; 

    },
    proxyErrorHandler: (err, res, next) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error' });
    }
}


// proxy options for post routes
const postProxyOptions = { 
    proxyReqPathResolver: (req) => {

        const path = req.originalUrl.replace(
            "/v2/api/post",
            `/${process.env.POST_VERSION}/api/post`
        );

        console.log("Proxy Path:", path);

        return path; 

    },
    proxyErrorHandler: (err, res, next) => {
        console.error('Proxy error:', err);
        res.status(500).json({ error: 'Proxy error' });
    }
}


//middleware
app.use(helmet());
app.use(configureCors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(createRateLimiter( 100, 10 * 60 * 1000));


app.use('/v1/api/auth',proxy(process.env.IDENTITY_SERVICE_URL, { 
        ...identityProxyOptions,
        proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
            proxyReqOpts.headers['content-type'] = 'application/json';
            return proxyReqOpts;
        },
        userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
            logger.info(`Proxying request to ${process.env.IDENTITY_SERVICE_URL} with url = ${userReq.originalUrl}`);
            return proxyResData;
        }
    })
);


app.use('/v2/api/post',isAuthenticated,proxy(process.env.POST_SERVICE_URL, { 
    ...postProxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers['content-type'] = 'application/json';
        proxyReqOpts.headers['x-user-id'] = srcReq.user.userId
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Proxying request to ${process.env.POST_SERVICE_URL} with url = ${userReq.originalUrl}`);
        return proxyResData;
    }
}));



app.listen(PORT, () => {
    console.log(`API Gateway is running on port http://localhost:${PORT}`);
    console.log(`Proxying requests to Identity Service at ${process.env.IDENTITY_SERVICE_URL}`);
    console.log(`Proxying requests to post Service at ${process.env.POST_SERVICE_URL}`);
    console.log(`Proxying requests to Identity Service with version ${process.env.AUTH_VERSION}`);
    console.log(`Proxying requests to post Service with version ${process.env.POST_VERSION}`);
});

