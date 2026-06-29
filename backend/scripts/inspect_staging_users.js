import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
const ROOT = path.resolve(path.join(path.dirname(import.meta.url.replace('file://','')),'..','..'));
const ENV_FILE = path.join(ROOT,'backend','.env.local');
const envText = fs.readFileSync(ENV_FILE,'utf8');
const m = envText.match(/^DATABASE_URL=(.+)$/m);
let DB_URL = m[1].trim(); if (DB_URL.startsWith('"') && DB_URL.endsWith('"')) DB_URL = DB_URL.slice(1,-1);
const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

async function cols(table){
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position", [table]);
  return res.rows.map(r=>r.column_name);
}
async function sample(table){
  const res = await pool.query(`SELECT * FROM \"${table}\" LIMIT 5`);
  return res.rows;
}
(async ()=>{
  try{
    for(const t of ['stg_user_export','stg_utilisateurs__2_']){
      console.log('\nTABLE', t);
      try{
        const c = await cols(t);
        console.log('COLUMNS:', c.join(', '));
        const s = await sample(t);
        console.log('SAMPLE ROWS:', s);
      }catch(e){
        console.log('Error reading', t, e.message);
      }
    }
  }catch(err){ console.error(err); }
  finally{ await pool.end(); }
})();
