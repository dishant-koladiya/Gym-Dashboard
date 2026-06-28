import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import * as db from '../db/db.ts';
import { User } from '../types.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is required');
  return secret;
}
const JWT_SECRET = getJwtSecret();

export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required fields.' });
    return;
  }

  try {
    const existingUser = await db.queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingUser) {
      res.status(400).json({ error: 'Email address is already registered.' });
      return;
    }

    const userId = 'user-' + crypto.randomBytes(4).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'admin';

    await db.run(
      'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, name, email.toLowerCase(), hashedPassword, userRole]
    );

    const newUser = await db.queryOne<User>('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [userId]);

    if (!newUser) {
      throw new Error('Failed to retrieve newly created user.');
    }

    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during user registration.' });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required fields.' });
    return;
  }

  try {
    const dbUser = await db.queryOne<{ id: string; name: string; email: string; password: string; role: string; created_at: string }>(
      'SELECT id, name, email, password, role, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (!dbUser) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatched = await bcrypt.compare(password, dbUser.password);
    if (!isMatched) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const user: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      created_at: dbUser.created_at,
    };

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (error: unknown) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during authentication login.' });
  }
}

export async function profile(req: Request, res: Response) {
  const authReq = req as AuthenticatedRequest;
  if (!authReq.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  try {
    const user = await db.queryOne<User>(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
      [authReq.user.id]
    );

    if (!user) {
      res.status(404).json({ error: 'User profiles not found.' });
      return;
    }

    res.json(user);
  } catch (error: unknown) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Server error retrieving user profile.' });
  }
}
