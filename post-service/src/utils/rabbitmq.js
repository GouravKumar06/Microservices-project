const amqp = require("amqplib");
const logger = require("./logger");

let connection = null;
let channel = null;


const EXCHANGE_NAME = "post_events";


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.connectRabbitMQ = async () => {

    while (true) {

        try {

            logger.info("Connecting to RabbitMQ...");

            connection = await amqp.connect(process.env.RABBITMQ_URL);

            channel = await connection.createChannel();

            await channel.assertExchange(
                EXCHANGE_NAME,
                "topic",
                { durable: false }
            );

            logger.info("RabbitMQ Connected");

            break;

        } catch (err) {

            logger.error("RabbitMQ not ready. Retrying in 5 seconds...");

            await sleep(5000);

        }
    }
};

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