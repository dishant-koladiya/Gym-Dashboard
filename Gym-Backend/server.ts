import 'dotenv/config';

import logger from './src/logger.ts';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { initializeDb } from './src/db/db.ts';
import { uploadAvatar } from './src/middleware/upload.ts';

import * as authController from './src/controllers/authController.ts';
import * as memberController from './src/controllers/memberController.ts';

import * as dashboardController from './src/controllers/dashboardController.ts';
import * as transactionController from './src/controllers/transactionController.ts';
import * as configController from './src/controllers/configController.ts';
import * as subscriptionPlanController from './src/controllers/subscriptionPlanController.ts';

import { authMiddleware } from './src/middleware/auth.ts';

const app = express();
let dbInitialized = false;

export async function ensureDb() {
  if (dbInitialized) return;
  await initializeDb();
  dbInitialized = true;
  logger.info('Database initialized successfully.');
}

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const uploadsDir = path.resolve('public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.get('/api/auth/profile', authMiddleware, authController.profile);

app.get('/api/dashboard/stats', authMiddleware, dashboardController.getDashboardStats);

app.get('/api/members', authMiddleware, memberController.getAllMembers);
app.get('/api/members/active', authMiddleware, memberController.getAllMembers);
app.get('/api/members/:id', authMiddleware, memberController.getMemberById);
app.post('/api/members', authMiddleware, memberController.createMember);
app.put('/api/members/:id', authMiddleware, memberController.updateMember);
app.delete('/api/members/:id', authMiddleware, memberController.deleteMember);

app.get('/api/subscription-plans', authMiddleware, subscriptionPlanController.getAll);
app.post('/api/subscription-plans', authMiddleware, subscriptionPlanController.create);
app.put('/api/subscription-plans/:id', authMiddleware, subscriptionPlanController.update);
app.delete('/api/subscription-plans/:id', authMiddleware, subscriptionPlanController.remove);

app.get('/api/transactions', authMiddleware, transactionController.getAll);
app.post('/api/transactions', authMiddleware, transactionController.create);

app.get('/api/admin', authMiddleware, configController.getAdmin);
app.post('/api/admin', authMiddleware, configController.updateAdmin);
app.post('/api/admin/avatar', authMiddleware, uploadAvatar.single('avatar'), configController.uploadAdminAvatar);
app.get('/api/gym', configController.getGym);
app.post('/api/gym', authMiddleware, configController.updateGym);
app.get('/api/settings', configController.getSettings);
app.post('/api/settings', authMiddleware, configController.updateSettings);

app.post('/api/auth/signup', authController.register);
app.get('/api/memberships/plans', authMiddleware, subscriptionPlanController.getAll);
app.post('/api/memberships/plans', authMiddleware, subscriptionPlanController.create);
app.post('/api/memberships/subscribe', authMiddleware, memberController.subscribe);
app.get('/api/payments', authMiddleware, transactionController.getAll);

export default app;

if (!process.env.VERCEL) {
  const PORT = parseInt(process.env.PORT || '5000');
  app.listen(PORT, '0.0.0.0', async () => {
    try {
      await ensureDb();
    } catch (error) {
      logger.error({ err: error }, 'Critical Database initialization failure');
      process.exit(1);
    }
    logger.info(`Gym API server listening at http://0.0.0.0:${PORT}`);
  });
}
