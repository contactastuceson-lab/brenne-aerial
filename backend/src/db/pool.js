import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('❌ Erreur pool PostgreSQL:', err);
});

// Test de connexion
try {
  const result = await pool.query('SELECT NOW()');
  console.log('✅ PostgreSQL connecté:', result.rows[0].now);
} catch (error) {
  console.error('❌ PostgreSQL non connecté:', error.message);
  console.error('Vérifiez DATABASE_URL dans .env.local');
}

export default pool;
