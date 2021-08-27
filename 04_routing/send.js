const amqp = require("amqplib/callback_api");
const RandomMessageGenerator = require("../RandomMessageGenerator");

const generator = new RandomMessageGenerator();

amqp.connect((error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    const exchangeName = "logs";
    const exchangeType = "direct";
    const exchangeOpts = { durable: false };

    channel.assertExchange(exchangeName, exchangeType, exchangeOpts);

    setInterval(() => {
      const bindingKeys = ["info", "warn", "error"];
      const routingKey = bindingKeys[Math.floor(Math.random() * 2)];
      const msg = generator.gen();
      const binary = Buffer.from(msg);
      channel.publish(exchangeName, routingKey, binary);
      console.log("[x] Sent: [%s] %s", routingKey, msg);
    }, 1000);
  });
});
