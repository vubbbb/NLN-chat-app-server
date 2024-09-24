import { Router } from "express";
import { searchContacts, getContactsForDMList } from "../controllers/ContactController.js";

const contactsRoutes = Router();

contactsRoutes.post("/search", searchContacts);
contactsRoutes.post("/getDMList", getContactsForDMList);

export default contactsRoutes;