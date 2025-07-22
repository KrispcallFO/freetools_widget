import express from 'express';
import cors from 'cors';
import router from './routes/routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ✅ Middlewares
// app.use(cors({
//     origin: [process.env.CLIENT_URL || 'http://127.0.0.1:8080', 'http://127.0.0.1:5500','http://127.0.0.1:51518','http://127.0.0.1:5502',],
//     credentials: true,
// }));

app.use(cors());

app.use(express.json()); // For parsing JSON
app.use(express.urlencoded({ extended: true })); // ✅ For parsing form data

// ✅ Routes
app.use('/', router);

export default app;
