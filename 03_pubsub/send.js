const amqp = require("amqplib/callback_api");
const RandomMessageGenerator = require("../RandomMessageGenerator");

const generator = new RandomMessageGenerator();

amqp.connect("amqp://localhost", (error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    // Exchange를 정의한다.
    const exchangeName = "logs";
    const exchangeType = "fanout";
    const exchangeOpts = { durable: false };
    channel.assertExchange(exchangeName, exchangeType, exchangeOpts);

    setInterval(() => {
      const message = generator.gen();
      const routingKey = ""; // 아직 안 배운 파라미터.
      const binary = Buffer.from(message);

      // 이제부터 Producer는 Exchange에 대해서만 알면 된다.
      // Queue는 Consumer가 알아서 Exchange로 바인딩하기 때문이다.
      // Queue는 더 이상 쓰지 않는다.
      // channel.sendToQueue(queue, binary, { persistent: true });
      channel.publish(exchangeName, routingKey, binary);

      console.log("[x] Sent: %s", message);
    }, 1000);
  });
});
