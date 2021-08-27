const amqp = require("amqplib/callback_api");

amqp.connect((error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    channel.assertQueue("rpc_queue", { durable: false });

    channel.consume(
      "rpc_queue",
      (msg) => {
        const correlationId = msg.properties.correlationId;
        const destQueue = msg.properties.replyTo;

        const content = msg.content.toString();
        const requestName = content.slice(content.indexOf("I'm") + 4);
        const responseMsg = "Hi " + requestName + "! I'm the server.";

        channel.sendToQueue(destQueue, Buffer.from(responseMsg), {
          correlationId, // 꼭 보내야 할 이유는 없는 것 같은데 체크 용도로 사용하는 듯하다.
        });
        console.log("[x] Sent: [%s] %s", correlationId, responseMsg);
      },
      {
        noAck: true,
      }
    );
  });
});
