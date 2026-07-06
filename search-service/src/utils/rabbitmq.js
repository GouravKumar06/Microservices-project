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


exports.consumeEvent = async(routingKey,callback) => {
    try{
        if(!channel){
            logger.error("RabbitMQ channel is not established. Cannot consume event.");
            return;
        }

        const q = await channel.assertQueue('', { exclusive: true });


        await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

        channel.consume(q.queue, (msg) => {
            if(msg !== null){
                const content = JSON.parse(msg.content.toString());
                logger.info(`Event consumed from RabbitMQ with routing key: ${routingKey}`, content);

                callback(content);
                
                channel.ack(msg);
            }
        })

        logger.info(`Listening for events on routing key: ${routingKey}`);
    }catch(error){
        logger.error("Error Consuming event to RabbitMQ", error);
    }
}