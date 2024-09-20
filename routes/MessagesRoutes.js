import { Router } from "express";
import { getMessages } from "../controllers/MessagesController.js";

const messagesRouter = Router();

messagesRouter.get("/get-messages", getMessages);

export default messagesRouter;