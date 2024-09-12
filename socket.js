import { Server as SocketIOServer } from "socket.io";

const socketSetup = (server) => {
  const io = SocketIOServer(server, {
    cors: {
      method: ["GET", "POST"],
    },
  });

  const useSocketMap = new Map();
};

export default socketSetup;
