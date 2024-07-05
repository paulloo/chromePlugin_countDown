import type { PlasmoCSConfig } from "plasmo"
import { connectToHub } from "@plasmohq/messaging/pub-sub"

export const config: PlasmoCSConfig = {
  world: "MAIN"
}

function initializeOrReconnectClientHub(reconnectAttempt = 0) {
  // 检查环境变量是否存在
  console.log(process.env.PLASMO_PUBLIC_EXTENSION_ID)
  if (!process.env.PLASMO_PUBLIC_EXTENSION_ID) {
    throw new Error("PLASMO_PUBLIC_EXTENSION_ID is not defined. Please update it in your .env file.")
  }

  // 连接到 Hub
  const port = connectToHub(process.env.PLASMO_PUBLIC_EXTENSION_ID);
  // 设置监听器
  port.onMessage.addListener((m) => {
    console.log("Message received from BGSW HUB:", m);
  });

  port.onDisconnect.addListener(() => {
    console.log("Port disconnected. Attempting to reconnect...");

    // 避免死循环，通过添加重连次数限制或延迟
    if (reconnectAttempt < 3) { // 限制重连尝试的次数为3次
      setTimeout(() => initializeOrReconnectClientHub(reconnectAttempt + 1), 1000 * (reconnectAttempt + 1)); // 每次重连延迟时间递增
    } else {
      console.error("Failed to reconnect after several attempts.");
    }
  });

  return port;
}


// 用来存储和管理 clientHub 相关操作的对象
const clientHubManager = {
  description: "Client Hub Manager",
  port: null,

  connect: function () {
    this.port = initializeOrReconnectClientHub();
    if (!this.port) {
      console.error("Failed to connect to clientHub.");
      return;
    }
    console.log("Connected to clientHub successfully.");
  },

  send: function (message: string) {
    if (this.isConnected()) {
      this.port.postMessage({ message });
    } else {
      console.log("ClientHub is disconnected, attempting to reconnect...");
      this.connect();
      // 再次检查以确认连接成功
      if (this.isConnected()) {
        this.port.postMessage({ message });
      } else {
        console.error("Unable to connect to clientHub after retry.");
      }
    }
  },

  isConnected: function () {
    return this.port && this.port.name === "clientHub";
  }
};

// 将 clientHubManager 挂载到 window 对象上
window.clientHub = clientHubManager;

