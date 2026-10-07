import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/projects.routes.js';
import documentRoutes from './routes/documents.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { pool, supabase } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow development and production origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// System Health & Diagnostics Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Nexus AI Research Synthesizer API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: pool ? 'PostgreSQL Pool Connected' : supabase ? 'Supabase Connected' : 'Local Fallback / Memory Active',
    aiEngine: process.env.GEMINI_API_KEY ? 'Gemini 2.5 Flash Configured' : 'Heuristic Mode Ready'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/settings', settingsRoutes);

// 404 Route Handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`\n========================================================`);
  console.log(` 🚀 Nexus API Server running on port ${PORT}`);
  console.log(` 🌐 Healthcheck: http://localhost:${PORT}/api/health`);
  console.log(` 📂 Supabase Database: ${process.env.DATABASE_URL ? 'Connected via DATABASE_URL' : 'In-Memory Development Mode'}`);
  console.log(` 🤖 Google Gemini AI: ${process.env.GEMINI_API_KEY ? 'Enabled via @google/genai' : 'Local Resilient Synthesizer'}`);
  console.log(`========================================================\n`);
});

export default app;
