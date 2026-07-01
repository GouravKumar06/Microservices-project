const cors = require('cors');

const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}


const configureCors = (options) => {
    return cors(options);
}

module.exports = configureCors;

