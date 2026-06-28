import app, { ensureDb } from '../Gym-Backend/server.ts';

let initialized = false;

export default async function handler(req: any, res: any) {
  if (!initialized) {
    try {
      await ensureDb();
      initialized = true;
    } catch (error) {
      console.error('DB init failed:', error);
    }
  }
  return app(req, res);
}
