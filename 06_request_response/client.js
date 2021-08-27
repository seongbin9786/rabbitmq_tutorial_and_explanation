const amqp = require("amqplib/callback_api");
const { v4: generateUUId } = require("uuid");

const correlationId = generateUUId();

amqp.connect((error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    channel.assertQueue("rpc_queue", { durable: false });

    channel.assertQueue("", { exclusive: true }, (error2, tmpQueue) => {
      if (error2) throw error2;

      channel.consume(
        tmpQueue.queue,
        (msg) => {
          if (msg.properties.correlationId != correlationId)
            throw Error("Invalid CorrelationId");
          if (msg.content)
            console.log(
              " [Received] [Id: %s] %s",
              msg.properties.correlationId,
              msg.content.toString()
            );
        },
        { noAck: true }
      );

      channel.sendToQueue("rpc_queue", Buffer.from("I'm " + tmpQueue.queue), {
        correlationId,
        replyTo: tmpQueue.queue,
      });

      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        tmpQueue.queue
      );
    });
  });
});
