const dgram = require("node:dgram");
const { WebSocketServer, WebSocket } = require("ws");

const UDP_PORT = 4210;
const WEBSOCKET_PORT = 8080;

const udpServer = dgram.createSocket("udp4");

const webSocketServer = new WebSocketServer({
  host: "127.0.0.1",
  port: WEBSOCKET_PORT,
});

let receivedPackets = 0;
let lastDeviceAddress = "未受信";

webSocketServer.on("listening", () => {
  console.log(`WebSocket: ws://127.0.0.1:${WEBSOCKET_PORT}`);
});

webSocketServer.on("connection", (socket) => {
  console.log("ゲーム画面が接続しました");

  socket.send(JSON.stringify({
    type: "status",
    connected: true,
    message: "IMU中継サーバーへ接続しました",
  }));

  socket.on("close", () => {
    console.log("ゲーム画面との接続が終了しました");
  });
});

udpServer.on("error", (error) => {
  console.error("UDPエラー:", error.message);
});

udpServer.on("message", (message, remote) => {
  try {
    const imu = JSON.parse(message.toString("utf8"));

    receivedPackets++;
    lastDeviceAddress = remote.address;

    const gameData = JSON.stringify({
      type: "imu",
      device: remote.address,
      receivedAt: Date.now(),
      ...imu,
    });

    for (const client of webSocketServer.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(gameData);
      }
    }

    if (receivedPackets % 20 === 0) {
      console.log(
        `受信 ${receivedPackets} | M5 ${lastDeviceAddress} | ` +
        `A ${imu.ax.toFixed(2)}, ${imu.ay.toFixed(2)}, ${imu.az.toFixed(2)} | ` +
        `G ${imu.gx.toFixed(1)}, ${imu.gy.toFixed(1)}, ${imu.gz.toFixed(1)}`
      );
    }
  } catch (error) {
    console.warn("解析できないデータ:", message.toString("utf8"));
  }
});

udpServer.on("listening", () => {
  console.log("----------------------------------------");
  console.log("ラジオ体操ヒーローズ IMU Bridge");
  console.log(`UDP受信ポート: ${UDP_PORT}`);
  console.log(`WebSocketポート: ${WEBSOCKET_PORT}`);
  console.log("終了: Ctrl + C");
  console.log("----------------------------------------");
});

udpServer.bind(UDP_PORT, "0.0.0.0");