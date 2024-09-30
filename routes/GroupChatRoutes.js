import { Router } from "express";
import { createGroupChat, getUserGroupChats } from "../controllers/GroupChatController.js";

const groupChatRoutes = Router();

groupChatRoutes.post("/create-group-chat", createGroupChat);
groupChatRoutes.get("/get-user-group-chats", getUserGroupChats);


export default groupChatRoutes;