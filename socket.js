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
    for (const socketID of useSocketMap.entries()) {
      if (socketID === socket.id) {
        useSocketMap.delete(socketID);
        console.log(`${socketID} removed from map`);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    // Tạo đối tượng tin nhắn
    const messageDataFromClient = {
      sender: message.sender,
      receiver: message.receiver,
      messageType: message.messageType,
      content: message.messageType === "text" ? message.content : undefined,
      fileURL: message.messageType !== "text" ? message.fileURL : undefined,
    };
    try {
      // Tạo mới tin nhắn mà không sử dụng callback
      const createdMessage = await Message.create(messageDataFromClient);

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
    console.log(`Someone connected with socketID: ${socket.id}`);
    useSocketMap.set(socket.id);

    socket.on("sendMessage", (message) => {
      sendMessage(message);
      socket.emit("recieveMessage", message);
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
