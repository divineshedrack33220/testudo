import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import pageRoutes from './routes/pages.js';
import serviceRoutes from './routes/services.js';
import teamRoutes from './routes/team.js';
import messageRoutes from './routes/messages.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import statsRoutes from './routes/stats.js';
import testimonialRoutes from './routes/testimonial.js';
import partnerRoutes from './routes/partner.js';
import faqRoutes from './routes/faq.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vaultRoot = path.resolve(__dirname, '../../');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ 
  origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:3000', 'http://127.0.0.1:5500', `http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`],
  credentials: true 
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard/stats', statsRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/faqs', faqRoutes);

// Serve frontend static files
app.use(express.static(vaultRoot));
app.use('/admin', express.static(path.join(vaultRoot, 'admin')));
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

// Fallback: serve admin/index.html for admin login
app.get('/admin', (req, res) => res.sendFile(path.join(vaultRoot, 'admin', 'index.html')));
app.get('/admin/*', (req, res) => res.sendFile(path.join(vaultRoot, 'admin', 'index.html')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ 
    success: false, 
    message: err.message || 'Internal server error' 
  });
});

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();