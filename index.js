import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/AuthRoutes.js';
import socketSetup from './socket.js';
import contactsRoutes from './routes/ContactRoutes.js';
import messagesRoutes from './routes/MessagesRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const databaseURL = "mongodb+srv://vubinh69:1307@react-chat-app.p5hkp3i.mongodb.net/?retryWrites=true&w=majority&appName=react-chat-app";

app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    origin: '*',
}));

app.use('/uploads/profiles', express.static('uploads/profiles'));

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

socketSetup(server);

mongoose.connect(databaseURL).then(() => {
    console.log('Connected to the database');
}).catch((error) => {
    console.log(error.message);
});