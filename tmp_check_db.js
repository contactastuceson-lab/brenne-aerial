import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

// Load backend env
const envPath = './backend/.env.local';
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('No backend/.env.local found');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  try {
    const now = await pool.query('SELECT NOW()');
    console.log('Connected, now=', now.rows[0].now);
    const count = await pool.query('SELECT COUNT(*) FROM users');
    console.log('Users count=', count.rows[0].count);
    const rows = await pool.query('SELECT id, email, username, display_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
    console.log('Recent users:');
    console.table(rows.rows);
  } catch (err) {
    console.error('DB error:', err.message);
  } finally {
    await pool.end();
  }
})();
