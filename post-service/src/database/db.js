const mongoose = require('mongoose');
const logger = require('../utils/logger')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)

        logger.info('MongoDB connected successfully');

    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
    
}

module.exports = connectDB;