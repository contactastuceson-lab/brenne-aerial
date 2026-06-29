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
  const client = await pool.connect();
  try{
    const sql = `WITH src AS (
      SELECT trim(lower(email::text)) as email FROM stg_user_export
      UNION ALL
      SELECT trim(lower(email::text)) as email FROM stg_utilisateurs__2_
    )
    SELECT email, count(*) as cnt FROM src WHERE email IS NOT NULL AND email <> '' GROUP BY email HAVING count(*)>1 ORDER BY cnt DESC;`;
    const res = await client.query(sql);
    console.log('duplicates:', res.rows);
    const total = await client.query('SELECT COUNT(*) FROM (SELECT trim(lower(email::text)) as email FROM stg_user_export UNION ALL SELECT trim(lower(email::text)) as email FROM stg_utilisateurs__2_) s WHERE email IS NOT NULL AND email <> ""');
    console.log('total source emails non-null:', total.rows[0]);
  }catch(e){ console.error(e); }
  finally{ client.release(); await pool.end(); }
})();
