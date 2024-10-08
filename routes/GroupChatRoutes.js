import { Router } from "express";
import { createGroupChat, getUserGroupChats, getAllMessagesFromGroup } from "../controllers/GroupChatController.js";

const groupChatRoutes = Router();

groupChatRoutes.post("/create-group-chat", createGroupChat);
groupChatRoutes.post("/get-user-group-chats", getUserGroupChats);
groupChatRoutes.post("/get-group-messages", getAllMessagesFromGroup);


export default groupChatRoutes;