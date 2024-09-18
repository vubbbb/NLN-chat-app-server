import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessageModel.js";

const socketSetup = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  const useSocketMap = new Map();

  // define function

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

  const sendMessage = async (message) => {
    console.log("sendMessage", message);
    const senderSocketID = useSocketMap.get(message.sender);
    const receiverSocketID = useSocketMap.get(message.receiver);

    const createdMessage = await Message.create(message);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email nickname")
      .populate("receiver", "id email nickname");


    if (receiverSocketID) {
      io.to(receiverSocketID).emit("recieveMessage", messageData);
    }
    if (senderSocketID) {
      io.to(senderSocketID).emit("recieveMessage", messageData);
    }

  };

  // socket.on

  io.on("connection", (socket) => {
    console.log(`User connected:`);
    const userID = socket.handshake.query.userID;

    if (userID) {
      useSocketMap.set(userID, socket.id);
      console.log(`User connected: ${userID} with socket id: ${socket.id}`);
    } else {
      console.log("UserID not provided in handshake query");
    }

    socket.on("sendMessage", sendMessage);

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
