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

  const userSocketMap = new Map(); // Map để lưu trữ userID => socketID

  // Hàm gửi tin nhắn
  const sendMessage = async (message) => {
    const messageDataFromClient = {
      sender: message.sender,
      receiver: message.receiver,
      messageType: message.messageType,
      content: message.messageType === "text" ? message.content : undefined,
      fileURL: message.messageType !== "text" ? message.fileURL : undefined,
    };

    try {
      // Tạo và lưu tin nhắn vào database
      const createdMessage = await Message.create(messageDataFromClient);

      // Lấy tin nhắn vừa tạo với thông tin của người gửi và người nhận
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email nickname")
        .populate("receiver", "id email nickname");

      // Lấy socketID của người nhận
      const receiverSocketID = userSocketMap.get(message.receiver);

      // Nếu người nhận đang kết nối, gửi tin nhắn cho họ
      if (receiverSocketID) {
        io.to(receiverSocketID).emit("recieveMessage", messageData);
        console.log(`Message sent to receiver ${message.receiver}`);
      }

      // Đồng thời gửi tin nhắn lại cho người gửi để cập nhật giao diện
      const senderSocketID = userSocketMap.get(message.sender);
      if (senderSocketID) {
        io.to(senderSocketID).emit("recieveMessage", messageData);
        console.log(`Message sent back to sender ${message.sender}`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Xử lý khi có kết nối mới
  io.on("connection", (socket) => {
    console.log(`User connected with socketID: ${socket.id}`);

    // Khi người dùng kết nối, truyền userID từ client để lưu trữ
    socket.on("register", (userID) => {
      userSocketMap.set(userID, socket.id).then(()=>{
        console.log(`User ${userID} connected with socketID: ${socket.id}`);
      });
    });

    // Xử lý sự kiện gửi tin nhắn từ client
    socket.on("sendMessage", (message) => {
      sendMessage(message);
    });

    // Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      for (const [userID, socketID] of userSocketMap.entries()) {
        if (socketID === socket.id) {
          userSocketMap.delete(userID);
          console.log(`User ${userID} disconnected and removed from map`);
          break;
        }
      }
    });
  });

  io.on("error", (err) => {
    console.error("Socket.io error:", err);
  });
};

export default socketSetup;
