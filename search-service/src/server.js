require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const configureCors = require('./config/cors.config');
const connectDB = require('./database/db');
const logger = require('./utils/logger');
const { createRedisLimiter, createRateLimiter } = require('./middleware/rateLimiter');

//routes
const urlVersioning = require('./middleware/apiVersioning');
const searchRoutes = require('./routes/search.routes');
const { connectRabbitMQ, consumeEvent } = require('./utils/rabbitmq');
const { handlePostCreatedEvent, handlePostDeletedEvent } = require('./eventHandlers/media.event');

const app = express();
const PORT = process.env.PORT;
const VERSION = process.env.VERSION;

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

app.use((req, res, next) => {
    console.log("==== Incoming Request ====");
    console.log(req.method);
    console.log(req.originalUrl);
    next();
});

app.use(urlVersioning(VERSION));
app.use(createRateLimiter(1000, 10 * 60 * 1000))


app.use('/v4/api/search', searchRoutes);


const startServer = async () => {
    try{
        await connectDB();

        await connectRabbitMQ();

        // consume all the events from RabbitMQ
        await consumeEvent("created",handlePostCreatedEvent);

        await consumeEvent("deleted",handlePostDeletedEvent);

        app.listen(PORT, () => {
            logger.info(`🚀 Hybrid Server fully live on port ${PORT}!`);
            logger.info(`👉 REST APIs: http://localhost:${PORT}`);
        });

    }catch(error){
        logger.error("error in express server : ",error)
    }
};

startServer();