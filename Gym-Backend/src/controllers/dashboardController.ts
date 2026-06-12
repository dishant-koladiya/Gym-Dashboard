import { Request, Response } from 'express';
import * as db from '../db/db.js';
import { DashboardStats } from '../types.js';

export async function getDashboardStats(req: Request, res: Response) {
  try {
    const totalMembersRow = await db.queryOne<{ count: number }>('SELECT COUNT(*) as count FROM members');
    const totalMembers = totalMembersRow ? Number(totalMembersRow.count) : 0;

    const activeMembersRow = await db.queryOne<{ count: number }>("SELECT COUNT(*) as count FROM members WHERE status = 'active'");
    const activeMembers = activeMembersRow ? Number(activeMembersRow.count) : 0;

    const revenueRow = await db.queryOne<{ revenue: number | null }>(`
      SELECT SUM(sp.price) as revenue
      FROM members m
      JOIN subscription_plans sp ON m.plan_id = sp.id
      WHERE m.status = 'active'
    `);
    const monthlyRevenue = revenueRow && revenueRow.revenue ? Math.round(Number(revenueRow.revenue) * 100) / 100 : 0;

    const genderRows = await db.query<{ gender: string; count: number }>(`
      SELECT gender, COUNT(*) as count
      FROM members
      GROUP BY gender
    `);
    const membersByGender = genderRows.map((r) => ({
      gender: r.gender,
      count: Number(r.count),
    }));

    if (!membersByGender.some((g) => g.gender === 'Male')) {
      membersByGender.push({ gender: 'Male', count: 0 });
    }
    if (!membersByGender.some((g) => g.gender === 'Female')) {
      membersByGender.push({ gender: 'Female', count: 0 });
    }

    const distributionRows = await db.query<{ name: string; value: number }>(`
      SELECT sp.name as name, COUNT(m.id) as value
      FROM members m
      JOIN subscription_plans sp ON m.plan_id = sp.id
      GROUP BY sp.name
    `);
    const membershipDistribution = distributionRows.map((r) => ({
      name: r.name,
      value: Number(r.value),
    }));

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenueByMonth = months.map((m, idx) => ({
      month: m,
      amount: (idx + 1) * 85 + 20,
    }));

    const stats: DashboardStats = {
      totalMembers,
      activeMembers,
      monthlyRevenue,
      revenueByMonth,
      membersByGender,
      membershipDistribution,
    };

    res.json(stats);
  } catch (error) {
    console.error('Calculate dashboard stats error:', error);
    res.status(500).json({ error: 'Server error computing dashboard overview statistics.' });
  }
}
