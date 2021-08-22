const amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost", (error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    const queue = "hello";

    // 1. Consumer가 먼저 생성될 수도 있으므로, 그 경우엔 Queue를 여기서 생성하도록
    // 여기서도 assertQueue 호출
    // 네트워크 호출일텐데 sync로 작동하는 걸까...?
    channel.assertQueue(queue, { durable: false });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    // 2. channel.consume: 비동기로 호출될 핸들러를 등록한다.
    channel.consume(
      queue,
      (msg) => {
        console.log(" [x] Received %s", msg.content.toString());
      },
      { noAck: true }
    );
  });
});
