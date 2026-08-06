const dgram = require("node:dgram");

const UDP_PORT = 4210;
const server = dgram.createSocket("udp4");

server.on("error", (error) => {
  console.error("UDP受信エラー:", error.message);
  server.close();
});

server.on("message", (message, remote) => {
  const text = message.toString("utf8");

  try {
    const imu = JSON.parse(text);

    console.log(
      `M5 ${remote.address} | ` +
      `加速度: ${imu.ax.toFixed(3)}, ${imu.ay.toFixed(3)}, ${imu.az.toFixed(3)} | ` +
      `ジャイロ: ${imu.gx.toFixed(3)}, ${imu.gy.toFixed(3)}, ${imu.gz.toFixed(3)}`
    );
  } catch {
    console.log(`受信: ${text}`);
  }
});

server.on("listening", () => {
  const address = server.address();

  console.log("----------------------------------------");
  console.log("M5StickC PLUS2のデータを待っています");
  console.log(`UDPポート: ${address.port}`);
  console.log("終了するときは Ctrl + C を押してください");
  console.log("----------------------------------------");
});

server.bind(UDP_PORT, "0.0.0.0");