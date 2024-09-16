import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/AuthRoutes.js';
import socketSetup from './socket.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    origin: '*',
}));

app.use('/uploads/profiles', express.static('uploads/profiles'));

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);

const server = app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});

socketSetup(server);

mongoose.connect(databaseURL).then(() => {
    console.log('Connected to the database');
}).catch((error) => {
    console.log(error.message);
});