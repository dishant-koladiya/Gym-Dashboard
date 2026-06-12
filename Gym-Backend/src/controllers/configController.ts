import { Request, Response } from 'express';
import * as db from '../db/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getAdmin(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    const adminUser = await db.queryOne<{ id: string; full_name: string; email: string; role: string; avatar_url: string }>(
      "SELECT id, name as full_name, email, role, avatar_url FROM users WHERE id = $1",
      [user?.id]
    );
    if (adminUser) {
      res.json({
        fullName: adminUser.full_name,
        username: adminUser.email?.split('@')[0] || 'admin',
        email: adminUser.email,
        role: adminUser.role === 'admin' ? 'Super Administrator' : 'Staff',
        avatarUrl: adminUser.avatar_url || '',
      });
    } else {
      res.json({
        fullName: 'Admin User',
        username: 'admin',
        email: 'admin@gym.com',
        role: 'Super Administrator',
        avatarUrl: '',
      });
    }
  } catch (error) {
    console.error('Fetch admin error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateAdmin(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (user?.id) {
      const { fullName, avatarUrl } = req.body;
      if (fullName || avatarUrl) {
        const updates: string[] = [];
        const values: unknown[] = [];
        if (fullName) { updates.push('name = $' + (updates.length + 1)); values.push(fullName); }
        if (avatarUrl) { updates.push('avatar_url = $' + (updates.length + 1)); values.push(avatarUrl); }
        values.push(user.id);
        await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length}`, values);
      }
    }
    res.json({ success: true, admin: req.body });
  } catch (error) {
    console.error('Update admin error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getGym(req: Request, res: Response) {
  try {
    const gym = await db.queryOne<{ name: string; address: string; phone: string; website: string }>("SELECT name, address, phone, website FROM gym_info WHERE id = 'default'");
    if (gym) {
      res.json(gym);
    } else {
      res.json({
        name: 'Iron Pulse Performance Center',
        address: '242 Innovation Way, Tech District, San Francisco, CA 94103',
        phone: '+1 (555) 012-3456',
        website: 'www.ironpulse.gym',
      });
    }
  } catch (error) {
    console.error('Fetch gym error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateGym(req: Request, res: Response) {
  try {
    const { name, address, phone, website } = req.body;
    await db.run(
      "UPDATE gym_info SET name = $1, address = $2, phone = $3, website = $4 WHERE id = 'default'",
      [name, address, phone, website]
    );
    res.json({ success: true, gym: req.body });
  } catch (error) {
    console.error('Update gym error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function getSettings(req: Request, res: Response) {
  try {
    const settings = await db.queryOne<{ theme: string; email_updates: boolean; desktop_alerts: boolean }>("SELECT theme, email_updates, desktop_alerts FROM system_settings WHERE id = 'default'");
    if (settings) {
      res.json({
        theme: settings.theme || 'Light',
        emailUpdates: settings.email_updates,
        desktopAlerts: settings.desktop_alerts,
      });
    } else {
      res.json({ theme: 'Light', emailUpdates: true, desktopAlerts: false });
    }
  } catch (error) {
    console.error('Fetch settings error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const { theme, emailUpdates, desktopAlerts } = req.body;
    await db.run(
      "UPDATE system_settings SET theme = $1, email_updates = $2, desktop_alerts = $3 WHERE id = 'default'",
      [theme, emailUpdates, desktopAlerts]
    );
    res.json({ success: true, settings: req.body });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
}
export async function uploadAdminAvatar(req: Request, res: Response) {
  try {
    const user = (req as AuthenticatedRequest).user;
    if (!user?.id) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    const file = (req as { file?: Express.Multer.File }).file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const publicPath = `/uploads/${file.filename}`;
    await db.run('UPDATE users SET avatar_url = $1 WHERE id = $2', [publicPath, user.id]);
    res.json({ success: true, avatarUrl: publicPath });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Server error' });
  }
}
