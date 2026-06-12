import { Request, Response } from 'express';
import crypto from 'crypto';
import * as db from '../db/db.js';
import { Member } from '../types.js';

export async function getAllMembers(req: Request, res: Response) {
  try {
    const list = await db.query<Member>(`
      SELECT m.id, m.name, m.email, m.phone, m.gender, m.age, m.address, m.join_date, m.expiry_date, m.status, m.plan_id, sp.name as plan_name, sp.price
      FROM members m
      LEFT JOIN subscription_plans sp ON m.plan_id = sp.id
      ORDER BY m.join_date DESC
    `);
    res.json(list);
  } catch (error) {
    console.error('Fetch members error:', error);
    res.status(500).json({ error: 'Server error retrieving members.' });
  }
}

export async function getMemberById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const m = await db.queryOne<Member>(`
      SELECT m.id, m.name, m.email, m.phone, m.gender, m.age, m.address, m.join_date, m.expiry_date, m.status, m.plan_id, sp.name as plan_name
      FROM members m
      LEFT JOIN subscription_plans sp ON m.plan_id = sp.id
      WHERE m.id = $1
    `, [id]);

    if (!m) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }
    res.json(m);
  } catch (error) {
    console.error('Fetch member error:', error);
    res.status(500).json({ error: 'Server error retrieving member.' });
  }
}

export async function createMember(req: Request, res: Response) {
  const { name, email, phone, gender, age, address, join_date, expiry_date, status, plan_id } = req.body;

  if (!name || !email) {
    res.status(400).json({ error: 'Name and email are required fields.' });
    return;
  }

  try {
    const existing = await db.queryOne('SELECT id FROM members WHERE email = $1', [email]);
    if (existing) {
      res.status(400).json({ error: 'A member with this email address already exists.' });
      return;
    }

    let planNameForExpiry = '';
    if (plan_id) {
      const planExists = await db.queryOne<{ name: string }>('SELECT name FROM subscription_plans WHERE id = $1', [plan_id]);
      if (!planExists) {
        res.status(400).json({ error: 'The selected membership plan does not exist.' });
        return;
      }
      planNameForExpiry = planExists.name;
    }

    const id = 'member-' + crypto.randomBytes(4).toString('hex');
    const memberStatus = status || 'active';

    const computedExpiry = expiry_date || computeExpiryFromPlan(planNameForExpiry);

    await db.run(`
      INSERT INTO members (id, name, email, phone, gender, age, address, join_date, expiry_date, status, plan_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      id,
      name,
      email,
      phone || '',
      gender || 'Other',
      age ? Number(age) : 25,
      address || '',
      join_date || new Date().toISOString().split('T')[0],
      computedExpiry,
      memberStatus,
      plan_id || null,
    ]);

    const created = await db.queryOne<Member>(`
      SELECT m.id, m.name, m.email, m.phone, m.gender, m.age, m.address, m.join_date, m.expiry_date, m.status, m.plan_id, sp.name as plan_name
      FROM members m
      LEFT JOIN subscription_plans sp ON m.plan_id = sp.id
      WHERE m.id = $1
    `, [id]);

    res.status(201).json(created);
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({ error: 'Server error creating member.' });
  }
}

export async function updateMember(req: Request, res: Response) {
  const { id } = req.params;
  const { name, email, phone, gender, age, address, join_date, expiry_date, status, plan_id } = req.body;

  try {
    const existing = await db.queryOne<Member>('SELECT * FROM members WHERE id = $1', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }

    const finalName = name || existing.name;
    const finalEmail = email || existing.email;
    const finalPhone = phone || existing.phone;
    const finalGender = gender || existing.gender;
    const finalAge = age !== undefined ? Number(age) : existing.age;
    const finalAddress = address !== undefined ? address : existing.address;
    const finalJoinDate = join_date || existing.join_date;
    const finalExpiryDate = expiry_date !== undefined ? expiry_date : existing.expiry_date;
    const finalStatus = (status || existing.status).toLowerCase();
    const finalPlanId = plan_id !== undefined ? plan_id : existing.plan_id;

    if (finalEmail !== existing.email) {
      const emailConflict = await db.queryOne('SELECT id FROM members WHERE email = $1 AND id != $2', [finalEmail, id]);
      if (emailConflict) {
        res.status(400).json({ error: 'Another member is already registered with this email.' });
        return;
      }
    }

    if (finalPlanId) {
      const planExists = await db.queryOne('SELECT id FROM subscription_plans WHERE id = $1', [finalPlanId]);
      if (!planExists) {
        res.status(400).json({ error: 'The selected membership plan does not exist.' });
        return;
      }
    }

    await db.run(`
      UPDATE members
      SET name = $1, email = $2, phone = $3, gender = $4, age = $5, address = $6, join_date = $7, expiry_date = $8, status = $9, plan_id = $10
      WHERE id = $11
    `, [finalName, finalEmail, finalPhone, finalGender, finalAge, finalAddress, finalJoinDate, finalExpiryDate, finalStatus, finalPlanId || null, id]);

    const updated = await db.queryOne<Member>(`
      SELECT m.id, m.name, m.email, m.phone, m.gender, m.age, m.address, m.join_date, m.expiry_date, m.status, m.plan_id, sp.name as plan_name
      FROM members m
      LEFT JOIN subscription_plans sp ON m.plan_id = sp.id
      WHERE m.id = $1
    `, [id]);

    res.json(updated);
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Server error updating member.' });
  }
}

export async function deleteMember(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const existing = await db.queryOne('SELECT id FROM members WHERE id = $1', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }

    await db.run('DELETE FROM members WHERE id = $1', [id]);
    res.json({ success: true, message: 'Member deleted successfully.', id });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Server error deleting member.' });
  }
}

export async function subscribe(req: Request, res: Response) {
  const { memberId, planId } = req.body;

  if (!memberId || !planId) {
    res.status(400).json({ error: 'memberId and planId are required.' });
    return;
  }

  try {
    const member = await db.queryOne('SELECT id FROM members WHERE id = $1', [memberId]);
    if (!member) {
      res.status(404).json({ error: 'Member not found.' });
      return;
    }

    const plan = await db.queryOne<{ id: string; name: string }>('SELECT id, name FROM subscription_plans WHERE id = $1', [planId]);
    if (!plan) {
      res.status(404).json({ error: 'Plan not found.' });
      return;
    }

    const expiryDate = computeExpiryFromPlan(plan.name);

    await db.run('UPDATE members SET plan_id = $1, status = $2, expiry_date = $3 WHERE id = $4', [planId, 'active', expiryDate, memberId]);
    res.json({ success: true, memberId, planId, expiry_date: expiryDate });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Server error subscribing member to plan.' });
  }
}

function computeExpiryFromPlan(planName: string): string {
  const now = new Date();
  const lower = planName.toLowerCase();
  if (lower.includes('6 month') || lower.includes('half')) {
    now.setMonth(now.getMonth() + 6);
  } else if (lower.includes('year') || lower.includes('annual') || lower.includes('12')) {
    now.setFullYear(now.getFullYear() + 1);
  } else {
    now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString().split('T')[0];
}
