import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

let _pool: InstanceType<typeof Pool> | null = null;

function getPool(): InstanceType<typeof Pool> {
  if (!_pool) {
    _pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'gym_dashboard',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    _pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error:', err);
    });
  }
  return _pool;
}

export async function query<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function queryOne<T>(text: string, params: unknown[] = []): Promise<T | null> {
  const result = await getPool().query(text, params);
  return (result.rows[0] as T) || null;
}

export async function run(text: string, params: unknown[] = []): Promise<{ rowCount: number | null }> {
  const result = await getPool().query(text, params);
  return { rowCount: result.rowCount };
}

export async function initializeDb() {
  console.log('Initializing database tables...');

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).catch(() => {});

  await run(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT ''
  `).catch(() => {});

  await run(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      gender TEXT NOT NULL,
      age INTEGER NOT NULL,
      address TEXT DEFAULT '',
      join_date TEXT NOT NULL,
      expiry_date TEXT DEFAULT '',
      status TEXT NOT NULL,
      plan_id TEXT
    )
  `);

  await run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''`).catch(() => {});
  await run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS expiry_date TEXT DEFAULT ''`).catch(() => {});

  await run(`ALTER TABLE members DROP CONSTRAINT IF EXISTS members_plan_id_fkey`).catch(() => {});

  await run(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      term TEXT NOT NULL,
      price REAL NOT NULL,
      features TEXT NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      member_name TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      method_detail TEXT DEFAULT '',
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Completed',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS gym_info (
      id TEXT PRIMARY KEY DEFAULT 'default',
      name TEXT NOT NULL DEFAULT 'Iron Pulse Performance Center',
      address TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      website TEXT DEFAULT ''
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      theme TEXT DEFAULT 'Light',
      email_updates BOOLEAN DEFAULT true,
      desktop_alerts BOOLEAN DEFAULT false
    )
  `);

  const userCount = await queryOne<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if (userCount && Number(userCount.count) === 0) {
    console.log('Seeding initial gym database data...');

    const adminId = 'admin-1';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await run(
      'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
      [adminId, 'Dishant Koladiya', 'koladiyadishant11@gmail.com', hashedPassword, 'admin']
    );

    const guestPassword = await bcrypt.hash('fitness2026', 10);
    await run(
      'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5)',
      ['user-2', 'Guest Manager', 'guest@gym.com', guestPassword, 'staff']
    );

    const subscriptionPlansToSeed = [
      { id: 'sp-1', name: '1 Month', term: 'SHORT TERM', price: 1200, features: JSON.stringify(['All Equipment Access', 'Locker Room Access', 'Basic Fitness Assessment']), active: true },
      { id: 'sp-2', name: '6 Months', term: 'POPULAR', price: 4500, features: JSON.stringify(['All Equipment Access', 'Locker Room + Steam', '2 Guest Passes / Month', 'Group Classes Included']), active: true },
      { id: 'sp-3', name: '1 Year', term: 'BEST VALUE', price: 8000, features: JSON.stringify(['All Equipment Access', 'Locker Room + Steam + Sauna', '5 Guest Passes / Month', 'Group Classes Included', 'Personal Training (2 Sessions)', 'Free Gym Kit Bundle']), active: true },
    ];
    for (const sp of subscriptionPlansToSeed) {
      await run('INSERT INTO subscription_plans (id, name, term, price, features, active) VALUES ($1, $2, $3, $4, $5, $6)', [sp.id, sp.name, sp.term, sp.price, sp.features, sp.active]);
    }

    const membersToSeed = [
      { id: 'member-1', name: 'Sarah Jenkins', email: 'sarah@example.com', phone: '+1 (555) 123-4567', gender: 'Female', age: 28, address: '242 Innovation Way, San Francisco', join_date: '2026-01-15', expiry_date: '2026-07-15', status: 'active', plan_id: 'sp-2' },
      { id: 'member-2', name: 'Michael Chen', email: 'michael@example.com', phone: '+1 (555) 234-5678', gender: 'Male', age: 34, address: '42 Maple Street, San Francisco', join_date: '2026-02-01', expiry_date: '2027-02-01', status: 'active', plan_id: 'sp-3' },
      { id: 'member-3', name: 'Emily Rodriguez', email: 'emily@example.com', phone: '+1 (555) 345-6789', gender: 'Female', age: 22, address: '15 Oak Avenue, San Francisco', join_date: '2026-03-10', expiry_date: '2026-04-10', status: 'active', plan_id: 'sp-1' },
      { id: 'member-4', name: 'James Wilson', email: 'james@example.com', phone: '+1 (555) 456-7890', gender: 'Male', age: 41, address: '88 Pine Road, San Francisco', join_date: '2026-01-05', expiry_date: '2026-02-05', status: 'inactive', plan_id: 'sp-1' },
      { id: 'member-5', name: 'Sophia Martinez', email: 'sophia@example.com', phone: '+1 (555) 567-8901', gender: 'Female', age: 31, address: '7th Street, San Francisco', join_date: '2026-04-18', expiry_date: '2027-04-18', status: 'active', plan_id: 'sp-3' },
      { id: 'member-6', name: 'David Kim', email: 'davidk@example.com', phone: '+1 (555) 678-9012', gender: 'Male', age: 25, address: '33 Elm Boulevard, San Francisco', join_date: '2026-05-12', expiry_date: '2026-11-12', status: 'active', plan_id: 'sp-2' },
      { id: 'member-7', name: 'Chloe Taylor', email: 'chloe@example.com', phone: '+1 (555) 789-0123', gender: 'Female', age: 29, address: '19 Cedar Lane, San Francisco', join_date: '2026-03-24', expiry_date: '2026-09-24', status: 'inactive', plan_id: 'sp-2' }
    ];
    for (const m of membersToSeed) {
      await run('INSERT INTO members (id, name, email, phone, gender, age, address, join_date, expiry_date, status, plan_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [m.id, m.name, m.email, m.phone, m.gender, m.age, m.address || '', m.join_date, m.expiry_date, m.status, m.plan_id]);
    }

    await run(`INSERT INTO gym_info (id, name, address, phone, website) VALUES ('default', 'Iron Pulse Performance Center', '242 Innovation Way, Tech District, San Francisco, CA 94103', '+1 (555) 012-3456', 'www.ironpulse.gym')`);
    await run(`INSERT INTO system_settings (id, theme, email_updates, desktop_alerts) VALUES ('default', 'Light', true, false)`);

    console.log('Seeding complete.');
  } else {
    console.log('Database already has data. Skipping seed.');
  }
}
