import 'dotenv/config';

import logger from './src/logger.ts';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { initializeDb } from './src/db/db.js';
import { uploadAvatar } from './src/middleware/upload.js';

import * as authController from './src/controllers/authController.js';
import * as memberController from './src/controllers/memberController.js';

import * as dashboardController from './src/controllers/dashboardController.js';
import * as transactionController from './src/controllers/transactionController.js';
import * as configController from './src/controllers/configController.js';
import * as subscriptionPlanController from './src/controllers/subscriptionPlanController.js';

import { authMiddleware } from './src/middleware/auth.js';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '5000');

  try {
    await initializeDb();
    logger.info('Database initialized successfully.');
  } catch (error) {
    logger.error({ err: error }, 'Critical Database initialization failure');
    process.exit(1);
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
  // -------------------------------------------------
  // 2️⃣ Ensure uploads folder exists & serve it statically
  // -------------------------------------------------
  const uploadsDir = path.resolve('public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth
  app.post('/api/auth/login', authController.login);
  app.post('/api/auth/register', authController.register);
  app.get('/api/auth/profile', authMiddleware, authController.profile);

  // Dashboard
  app.get('/api/dashboard/stats', authMiddleware, dashboardController.getDashboardStats);

  // Members
  app.get('/api/members', authMiddleware, memberController.getAllMembers);
  app.get('/api/members/active', authMiddleware, memberController.getAllMembers);
  app.get('/api/members/:id', authMiddleware, memberController.getMemberById);
  app.post('/api/members', authMiddleware, memberController.createMember);
  app.put('/api/members/:id', authMiddleware, memberController.updateMember);
  app.delete('/api/members/:id', authMiddleware, memberController.deleteMember);

  // Subscription Plans (frontend-facing)
  app.get('/api/subscription-plans', authMiddleware, subscriptionPlanController.getAll);
  app.post('/api/subscription-plans', authMiddleware, subscriptionPlanController.create);
  app.put('/api/subscription-plans/:id', authMiddleware, subscriptionPlanController.update);
  app.delete('/api/subscription-plans/:id', authMiddleware, subscriptionPlanController.remove);

  // Transactions
  app.get('/api/transactions', authMiddleware, transactionController.getAll);
  app.post('/api/transactions', authMiddleware, transactionController.create);

  // Config (admin, gym, settings)
  app.get('/api/admin', authMiddleware, configController.getAdmin);
  app.post('/api/admin', authMiddleware, configController.updateAdmin);
  app.post('/api/admin/avatar', authMiddleware, uploadAvatar.single('avatar'), configController.uploadAdminAvatar);
  app.get('/api/gym', configController.getGym);
  app.post('/api/gym', authMiddleware, configController.updateGym);
  app.get('/api/settings', configController.getSettings);
  app.post('/api/settings', authMiddleware, configController.updateSettings);

  // Frontend compatibility aliases
  app.post('/api/auth/signup', authController.register);
  app.get('/api/memberships/plans', authMiddleware, subscriptionPlanController.getAll);
  app.post('/api/memberships/plans', authMiddleware, subscriptionPlanController.create);
  app.post('/api/memberships/subscribe', authMiddleware, memberController.subscribe);
  app.get('/api/payments', authMiddleware, transactionController.getAll);

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Gym API server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
