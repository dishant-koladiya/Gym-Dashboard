import { Request, Response } from 'express';
import crypto from 'crypto';
import * as db from '../db/db.js';

export async function getAll(req: Request, res: Response) {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const sort = (req.query.sort as string) || 'latest';
    const method = (req.query.method as string) || '';

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (method && method !== 'All Methods') {
      if (method === 'Credit Card') {
        conditions.push(`(payment_method = 'Visa' OR payment_method = 'Mastercard')`);
      } else {
        params.push(method);
        conditions.push(`payment_method = $${params.length}`);
      }
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const orderClause = sort === 'oldest'
      ? 'ORDER BY date ASC'
      : sort === 'amount'
      ? 'ORDER BY amount DESC'
      : 'ORDER BY created_at DESC';

    const offset = (page - 1) * limit;

    const countResult = await db.queryOne<{ count: number }>(`SELECT COUNT(*) as count FROM transactions ${whereClause}`, params);
    const totalItems = countResult ? Number(countResult.count) : 0;

    const list = await db.query<{
      id: string; member_name: string; plan_name: string; payment_method: string;
      method_detail: string; amount: number; date: string; status: string; created_at: string
    }>(
      `SELECT * FROM transactions ${whereClause} ${orderClause} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      data: list,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        range: totalItems === 0 ? [0, 0] : [offset + 1, Math.min(offset + limit, totalItems)],
      },
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Server error retrieving transactions.' });
  }
}

export async function create(req: Request, res: Response) {
  const { memberName, planName, paymentMethod, methodDetail, amount, date, status } = req.body;

  if (!memberName || !planName || !paymentMethod || amount === undefined) {
    res.status(400).json({ error: 'memberName, planName, paymentMethod, and amount are required.' });
    return;
  }

  try {
    const id = 'tx-' + crypto.randomBytes(4).toString('hex');
    await db.run(
      `INSERT INTO transactions (id, member_name, plan_name, payment_method, method_detail, amount, date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, memberName, planName, paymentMethod, methodDetail || '', Number(amount), date || new Date().toISOString(), status || 'Completed']
    );

    res.status(201).json({
      id,
      memberName,
      planName,
      paymentMethod,
      methodDetail: methodDetail || '',
      amount: Number(amount),
      date: date || new Date().toISOString(),
      status: status || 'Completed',
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Server error creating transaction.' });
  }
}
