import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}
const JWT_SECRET = getJwtSecret();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Header formatted as Bearer <token> is missing.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      id: string;
      name: string;
      email: string;
      role: string;
    };

    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}
