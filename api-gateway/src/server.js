require('dotenv').config();
const express = require('express');
const configureCors = require('./config/cors.config');
const helmet = require('helmet');
const createRateLimiter = require('./middleware/rateLimiter');
const proxyMiddleware = require('./consumers/proxy.consumers');
// const logger = require('./utils/logger');
// const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT;
const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(
            "/api/auth/v1",
            `/api/auth/${process.env.AUTH_VERSION}`
        );
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


app.use(createRateLimiter(100,10*60*1000));


app.use('/api/auth/v1',proxyMiddleware(process.env.IDENTITY_SERVICE_URL, proxyOptions));


app.listen(PORT, () => {
    console.log(`API Gateway is running on port http://localhost:${PORT}`);
    console.log(`Proxying requests to Identity Service at ${process.env.IDENTITY_SERVICE_URL}`);
    console.log(`Proxying requests to Identity Service with version ${process.env.AUTH_VERSION}`);
});

