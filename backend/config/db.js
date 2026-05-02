import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase requires SSL in all environments
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

pool.query('SELECT 1')
  .then(() => console.log('[db] Connected successfully'))
  .catch(err => console.error('[db] Connection failed:', err.message));

export default pool;
