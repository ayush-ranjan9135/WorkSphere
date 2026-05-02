import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { pool } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import teamRoutes from './routes/teams.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'Too many auth attempts' });
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Too many requests' });

app.use('/api/auth', authLimiter);
app.use(generalLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/teams', teamRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

// Auto-delete tasks completed more than 24 hours ago
const cleanupDoneTasks = async () => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM tasks WHERE status = 'done' AND completed_at < NOW() - INTERVAL '24 hours'`
    );
    if (rowCount > 0) console.log(`[cleanup] Deleted ${rowCount} completed task(s)`);
  } catch (e) {
    console.error('[cleanup] Error:', e.message);
  }
};
cleanupDoneTasks();
setInterval(cleanupDoneTasks, 60 * 60 * 1000); // every hour

// errorHandler must be last
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
