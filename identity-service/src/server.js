require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const configureCors = require('./config/cors.config');
const connectDB = require('./database/db');
const logger = require('./utils/logger');
const createRedisLimiter = require('./middleware/rateLimiter');

//routes
const UserRoutes = require('./routes/user.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(configureCors())


// rate limiter middleware
app.use( (req, res, next) => {
    createRedisLimiter.consume(req.ip)
        .then(() => next())
        .catch(() => {
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
            res.status(429).json({ error: 'Too Many Requests' });
        });
});


app.use('/api/users', UserRoutes);


const startServer = async () => {
    try{
        await connectDB();

        // 🚀 Start Apollo Server first
        // await server.start();

        // // redisConnection()
        // await client.connect()

        // await redisConnection(); 

        // await initEventManager();

        // app.use('/graphql', expressMiddleware(server, {
        //     context: buildAuthContext 
        // }));

        app.listen(PORT, () => {
            logger.info(`🚀 Hybrid Server fully live on port ${PORT}!`);
            logger.info(`👉 REST APIs: http://localhost:${PORT}`);
            // logger.info(`👉 GraphQL Endpoint: http://localhost:${PORT}/graphql`);
            // logger.info("redis client connected successfully");
        });

    }catch(error){
        logger.error("error in express server : ",error)
    }
};

startServer();