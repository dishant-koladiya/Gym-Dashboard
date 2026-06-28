import { Request, Response } from 'express';
import crypto from 'crypto';
import * as db from '../db/db.ts';
import { SubscriptionPlan } from '../types.ts';

export async function getAll(req: Request, res: Response) {
  try {
    const rows = await db.query<{ id: string; name: string; term: string; price: number; features: string; active: boolean; created_at: string }>('SELECT * FROM subscription_plans ORDER BY price ASC');
    const plans: SubscriptionPlan[] = rows.map((p) => {
      let parsedFeatures: string[] = [];
      try {
        parsedFeatures = JSON.parse(p.features);
      } catch {
        parsedFeatures = p.features ? p.features.split(',') : [];
      }
      return {
        id: p.id,
        name: p.name,
        term: p.term,
        price: p.price,
        features: parsedFeatures,
        active: p.active,
        created_at: p.created_at,
      };
    });
    res.json(plans);
  } catch (error) {
    console.error('Fetch subscription plans error:', error);
    res.status(500).json({ error: 'Server error retrieving subscription plans.' });
  }
}

export async function create(req: Request, res: Response) {
  const { name, term, price, features, active } = req.body;

  if (!name || price === undefined) {
    res.status(400).json({ error: 'Name and price are required.' });
    return;
  }

  try {
    const id = 'sp-' + crypto.randomBytes(4).toString('hex');
    const featuresStr = Array.isArray(features) ? JSON.stringify(features) : JSON.stringify([]);

    await db.run(
      'INSERT INTO subscription_plans (id, name, term, price, features, active) VALUES ($1, $2, $3, $4, $5, $6)',
      [id, name, term || 'STANDARD', Number(price), featuresStr, active !== undefined ? active : true]
    );

    res.status(201).json({
      id,
      name,
      term: term || 'STANDARD',
      price: Number(price),
      features: Array.isArray(features) ? features : [],
      active: active !== undefined ? active : true,
    });
  } catch (error) {
    console.error('Create subscription plan error:', error);
    res.status(500).json({ error: 'Server error creating subscription plan.' });
  }
}

export async function update(req: Request, res: Response) {
  const { id } = req.params;
  const { name, term, price, features, active } = req.body;

  try {
    const existing = await db.queryOne('SELECT id FROM subscription_plans WHERE id = $1', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Subscription plan not found.' });
      return;
    }

    const featuresStr = Array.isArray(features) ? JSON.stringify(features) : undefined;

    await db.run(
      `UPDATE subscription_plans SET
        name = COALESCE($1, name),
        term = COALESCE($2, term),
        price = COALESCE($3, price),
        features = COALESCE($4, features),
        active = COALESCE($5, active)
      WHERE id = $6`,
      [name || null, term || null, price ? Number(price) : null, featuresStr || null, active !== undefined ? active : null, id]
    );

    const updated = (await db.queryOne<{ id: string; name: string; term: string; price: number; features: string; active: boolean; created_at: string }>('SELECT * FROM subscription_plans WHERE id = $1', [id]))!;

    let parsedFeatures: string[] = [];
    try {
      parsedFeatures = JSON.parse(updated.features);
    } catch {
      parsedFeatures = updated.features ? updated.features.split(',') : [];
    }

    res.json({
      id: updated.id,
      name: updated.name,
      term: updated.term,
      price: updated.price,
      features: parsedFeatures,
      active: updated.active,
    });
  } catch (error) {
    console.error('Update subscription plan error:', error);
    res.status(500).json({ error: 'Server error updating subscription plan.' });
  }
}

export async function remove(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const existing = await db.queryOne('SELECT id FROM subscription_plans WHERE id = $1', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Subscription plan not found.' });
      return;
    }

    await db.run('DELETE FROM subscription_plans WHERE id = $1', [id]);
    res.json({ success: true, message: 'Subscription plan deleted successfully.', id });
  } catch (error) {
    console.error('Delete subscription plan error:', error);
    res.status(500).json({ error: 'Server error deleting subscription plan.' });
  }
}
