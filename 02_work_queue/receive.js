const amqp = require("amqplib/callback_api");

amqp.connect("amqp://localhost", (error0, conn) => {
  if (error0) throw error0;

  conn.createChannel((error1, channel) => {
    if (error1) throw error1;

    const queue = "task_queue";

    // 같은 Queue 이름으로 다른 옵션(durable 등)에서 차이가 생기는 경우 오류가 발생한다.
    channel.assertQueue(queue, { durable: true });

    // Consumer에서만 prefetch를 설정한다.
    // channel.prefetch(1);

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    // noAck: true 옵션은 Ack이 없고 RabbitMQ Server에서 consumer로 보내자 마자 제거 대상으로 지정한다.
    // noAck: false 옵션은 Ack을 직접 수행해야 한다. 대신 메시지를 처리한 이후에만 ack을 호출해야 하며,
    // ack을 수신하는 경우 RabbitMQ Server에서 보관된 메시지를 제거한다.
    // ack이 수신되지 않고 해당 메시지를 수신한 Consumer가 죽는 경우 (자세한 원리는 모른다.)
    // RabbitMQ Server는 해당 메시지를 re-enqueue한다.
    // ack을 직접 호출해야 하는 경우에도 메시지 Timeout은 없다. 따라서 메시지를 처리하는데 무제한의 시간이 드는 것도 성립한다.
    channel.consume(
      queue,
      (msg) => {
        console.log(" [x] Received: %s", msg.content.toString());
        setTimeout(() => {
          console.log(" [x] Processed and Acked: %s", msg.content.toString());
          channel.ack(msg); // ackAll도 있는데, 그건 왜 쓸까?
        }, msg.content.toString().length * 500);
      },
      { noAck: false }
    );
  });
});
