import { Server as SocketIOServer } from "socket.io";

const socketSetup = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      methods: ["GET", "POST"], // Đảm bảo từ methods đến methods
    },
  });

  const useSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userID, socketID] of useSocketMap.entries()) {
      if (socketID === socket.id) {
        useSocketMap.delete(userID);
        console.log(`UserID ${userID} removed from map`);
        break;
      }
    }
  };

  io.on("connection", (socket) => {
    const userID = socket.handshake.query.userID;

    if (userID) {
      // Kiểm tra nếu userID đã có kết nối
      if (useSocketMap.has(userID)) {
        console.log(
          `UserID ${userID} is already connected with socket id: ${useSocketMap.get(
            userID
          )}`
        );
      } else {
        // Nếu chưa có kết nối thì thêm mới
        useSocketMap.set(userID, socket.id);
        console.log(`User connected: ${userID} with socket id: ${socket.id}`);
      }
    } else {
      console.log("UserID not provided in handshake query");
    }

    socket.on("disconnect", () => {
      disconnect(socket);
    });
  });

  // Optional: handle error events
  io.on("error", (err) => {
    console.error("Socket.io error:", err);
  });
};

export default socketSetup;
