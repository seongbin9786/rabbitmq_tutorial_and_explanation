const amqp = require("amqplib/callback_api");

amqp.connect((error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    const exchangeName = "logs";
    const exchangeType = "direct";
    const exchangeOpts = { durable: false };
    channel.assertExchange(exchangeName, exchangeType, exchangeOpts);

    channel.assertQueue("", { exclusive: true }, (error2, tmpQueue) => {
      if (error2) throw error2;

      const bindingKeys = process.argv.slice(2);
      if (bindingKeys.length == 0) bindingKeys.push("warn", "info", "error"); // space로 입력 받음
      bindingKeys.forEach((bindingKey) =>
        channel.bindQueue(tmpQueue.queue, exchangeName, bindingKey)
      );

      channel.consume(
        tmpQueue.queue,
        (msg) => {
          if (msg.content)
            console.log(
              " [x] [%s] %s",
              msg.fields.routingKey,
              msg.content.toString()
            );
        },
        { noAck: true }
      );

      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        tmpQueue.queue
      );
    });
  });
});
