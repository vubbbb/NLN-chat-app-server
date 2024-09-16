import { Router } from "express";
import { searchContacts } from "../controllers/ContactController.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", searchContacts);

export default contactsRoutes;