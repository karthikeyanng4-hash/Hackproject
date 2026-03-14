import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './database.ts';
import authRoutes from './routes/auth.ts';
import chatRoutes from './routes/chats.ts';
import schemeRoutes from './routes/schemes.ts';
import profileRoutes from './routes/profile.ts';
import proxyRoutes from './routes/proxy.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/proxy', proxyRoutes);

// Initialize DB and Start Server
const startServer = async () => {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
