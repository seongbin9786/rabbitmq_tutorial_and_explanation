const amqp = require("amqplib/callback_api");

let msgNum = 0;

const createRandomString = () => {
  const length = Math.floor(Math.random() * 5); // 0<=len<=5
  return msgNum++ + "_" + "* ".repeat(length) + "*";
};

amqp.connect("amqp://localhost", (error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    const queue = "task_queue";

    // durable: true를 선언하면 RabbitMQ Server가 죽어도 Queue가 보존된다.
    // Queue가 보존되는 정확한 원리는 모른다.
    channel.assertQueue(queue, {
      durable: true,
    });

    // 1초마다 임의의 메시지를 전송
    setInterval(() => {
      let message = createRandomString();
      const binary = Buffer.from(message);

      // persistent: true 옵션을 사용하면 메시지도 보존되게 할 수 있다.
      // 다만 강한 일관성을 보장하지 않는다. 스토리지에 메시지를 쓰는 도중 죽거나
      // 캐시에만 저장돼있는 상태에서 죽는 경우 메시지는 보존되지 않는다.
      // 그러나 이 정도 수준으로도 '충분한 수준'의 일관성이 보장된다.
      channel.sendToQueue(queue, binary, { persistent: true });

      console.log("[x] Sent: %s", message);
    }, 1000);
  });
});
