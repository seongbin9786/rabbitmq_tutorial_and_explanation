const amqp = require("amqplib/callback_api");

let message = process.argv.slice(2).join(" ") || "Hello World"; // input from cli

amqp.connect("amqp://localhost", (error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    const queue = "task_queue";

    // 1. Queue 선언은 멱등적이다. 이미 존재하지 않는 경우만 새로 생성된다.
    channel.assertQueue(queue, {
      // TODO: 설명 없이 durable: true가 사용됐다.
      durable: true,
    });

    // string to binary
    // 2. 메시지는 Byte Array로 전송된다.
    const binary = Buffer.from(message);

    channel.sendToQueue(queue, binary, { persistent: true });

    console.log("[x] sent %s", message);

    setTimeout(() => {
      conn.close();
      process.exit(0);
    }, 500);
  });
});
