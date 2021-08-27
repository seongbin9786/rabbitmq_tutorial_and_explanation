const amqp = require("amqplib/callback_api");

amqp.connect((error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    const exchangeName = "logs";
    const exchangeType = "topic";
    const exchangeOpts = { durable: false };
    channel.assertExchange(exchangeName, exchangeType, exchangeOpts);

    channel.assertQueue("", { exclusive: true }, (error2, tmpQueue) => {
      if (error2) throw error2;

      // bindingKey는 Topic 개념을 적용한다.
      // 패턴을 활용한다.
      const bindingTopic = process.argv.slice(2)[0];
      console.log("bindingTopic: [", bindingTopic, "]");
      // if (bindingKeys.length == 0) bindingKeys.push("warn", "info", "error"); // space로 입력 받음
      // bindingKeys.forEach((bindingKey) =>
      // channel.bindQueue(tmpQueue.queue, exchangeName, bindingKey)
      // );
      channel.bindQueue(tmpQueue.queue, exchangeName, bindingTopic);

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
