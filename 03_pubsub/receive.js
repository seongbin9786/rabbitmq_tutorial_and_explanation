const amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost", (error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    // Exchange를 정의한다.
    const exchangeName = "logs";
    const exchangeType = "fanout";
    const exchangeOpts = { durable: false };
    channel.assertExchange(exchangeName, exchangeType, exchangeOpts);

    // 더 이상 Queue 이름은 필요가 없다.
    // const queue = "task_queue";
    channel.assertQueue(
      "",
      {
        exclusive: true,
      },
      // callback 함수로 queue 참조를 받아와야한다. Temp Queue니까.
      (error2, tmpQueue) => {
        if (error2) throw error2;

        // Exchange와 Queue를 바인딩한다.
        // queue 참조의 queue 필드가 큐의 이름이다. (네이밍이 참 구리다.)
        channel.bindQueue(tmpQueue.queue, "logs", "");

        // Consume 핸들러를 등록한다.
        channel.consume(
          tmpQueue.queue,
          (msg) => {
            if (msg.content) console.log(" [x] %s", msg.content.toString());
          },
          { noAck: true }
        );

        console.log(
          " [*] Waiting for messages in %s. To exit press CTRL+C",
          tmpQueue.queue
        );
      }
    );
  });
});
