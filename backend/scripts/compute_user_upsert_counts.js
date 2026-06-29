import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
const ROOT = path.resolve(path.join(path.dirname(import.meta.url.replace('file://','')),'..','..'));
const ENV_FILE = path.join(ROOT,'backend','.env.local');
const envText = fs.readFileSync(ENV_FILE,'utf8');
const m = envText.match(/^DATABASE_URL=(.+)$/m);
let DB_URL = m[1].trim(); if (DB_URL.startsWith('"') && DB_URL.endsWith('"')) DB_URL = DB_URL.slice(1,-1);
const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
(async ()=>{
  try{
    const sql = `WITH src AS (
      SELECT lower(email::text) as email FROM stg_user_export WHERE email IS NOT NULL AND email <> ''
      UNION ALL
      SELECT lower(email::text) as email FROM stg_utilisateurs__2_ WHERE email IS NOT NULL AND email <> ''
    )
    SELECT COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = src.email))::int as to_insert,
      COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM users u WHERE u.email = src.email))::int as to_update
    FROM src;`;
    const res = await pool.query(sql);
    console.log('User upsert stats:', res.rows[0]);
  }catch(e){ console.error(e); }
  finally{ await pool.end(); }
})();
