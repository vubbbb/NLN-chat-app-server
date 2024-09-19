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
    console.log("Message:", message);
    if (
      !message.sender ||
      !message.receiver ||
      !message.content ||
      !message.messageType
    ) {
      console.log(
        "Missing required fields: sender, receiver, content, or messageType"
      );
    }

    // Tạo đối tượng tin nhắn
    const messageDataFromClient = {
      sender: message.sender,
      receiver: message.receiver,
      messageType: message.messageType,
      content: message.messageType === "text" ? message.content : undefined,
      fileURL: message.messageType !== "text" ? message.fileURL : undefined,
    };
    console.log("Message data from client:", messageDataFromClient);
    try {
      // Tạo mới tin nhắn mà không sử dụng callback
      const createdMessage = await Message.create(message);

      // Tìm tin nhắn vừa tạo và populate thông tin người gửi và người nhận
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email nickname")
        .populate("receiver", "id email nickname");
      const senderSocketID = useSocketMap.get(message.sender);
      const receiverSocketID = useSocketMap.get(message.receiver);

      // Gửi tin nhắn đến người nhận và người gửi nếu họ có kết nối
      if (receiverSocketID) {
        io.to(receiverSocketID).emit("recieveMessage", messageData);
      }
      if (senderSocketID) {
        io.to(senderSocketID).emit("recieveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // socket.on

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    const userID = socket.handshake.query.userID;

    if (userID) {
      useSocketMap.set(userID, socket.id);
      console.log(`User connected: ${userID} with socket id: ${socket.id}`);
    } else {
      console.log("UserID not provided in handshake query");
    }

    socket.on("sendMessage", (message) => {
      sendMessage(message);
    });

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
