import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import songRoutes from './routes/songs.js';
import playlistRoutes from './routes/playlists.js';
import userRoutes from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';
import Song from './models/Song.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'GospelHub API is running', status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gospal:Dad4343@cluster0.8601trp.mongodb.net/gospelhub?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=true';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10
    });
    
    await Song.createIndexes();
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('⚠️ MongoDB connection error:', err.message);
  }
};

connectDB();

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

export default app;
