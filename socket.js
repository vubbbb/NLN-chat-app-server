import { Server as SocketIOServer } from "socket.io";

const socketSetup = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      method: ["GET", "POST"],
    },
  });

  const useSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`User disconnected: ${socket.id}`);
    for (const [userID, socketID] of useSocketMap.entries()) {
      if (socketID === socket.id) {
        useSocketMap.delete(userID);
        break;
      }
    }
  };

  io.on("connection", (socket) => {
    const userID = socket.handshake.query.userID;

    if (userID) {
      useSocketMap.set(userID, socket.id);
      console.log(`User connected: ${userID} with socket id: ${socket.id}`);
    } else {
      console.log("userID not provided");
    }

    socket.on("disconnect", () => {
      disconnect(socket);
    });
  });
};

export default socketSetup;
