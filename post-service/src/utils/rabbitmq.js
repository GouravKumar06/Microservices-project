const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;


const EXCHANGE_NAME = "post_events";


exports.connectRabbitMQ = async () => {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);

        channel = await connection.createChannel();

        await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false }); // durable: false means the exchange won't survive a broker restart
        logger.info("Connected to RabbitMQ");

        return channel;
    } catch (error) {
        logger.error("Error connecting to RabbitMQ", error);
    }
}


exports.publishEvent = async(routingKey,message) => {
    try{
        if(!channel){
            logger.error("RabbitMQ channel is not established. Cannot publish event.");
            return;
        }
        await channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
        logger.info(`Event published to RabbitMQ with routing key: ${routingKey}`);
    }catch(error){
        logger.error("Error publishing event to RabbitMQ", error);
    }
}