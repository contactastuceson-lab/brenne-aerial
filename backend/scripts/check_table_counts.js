import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

const ROOT = path.resolve(path.join(path.dirname(import.meta.url.replace('file://','')),'..','..'));
const ENV_FILE = path.join(ROOT,'backend','.env.local');
if (!fs.existsSync(ENV_FILE)) throw new Error('backend/.env.local not found');
const envText = fs.readFileSync(ENV_FILE,'utf8');
const m = envText.match(/^DATABASE_URL=(.+)$/m);
if (!m) throw new Error('DATABASE_URL not found');
let DB_URL = m[1].trim();
if (DB_URL.startsWith('"') && DB_URL.endsWith('"')) DB_URL = DB_URL.slice(1,-1);

const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

async function main(){
  try{
    const prodTables = ['users','messages','projects','notifications','appointments','reviews','subscriptions','audit_logs'];
    console.log('Production table counts:');
    for(const t of prodTables){
      try{
        const res = await pool.query(`SELECT COUNT(*)::int AS c FROM ${t}`);
        console.log(`${t}: ${res.rows[0].c}`);
      }catch(e){
        console.log(`${t}: (missing or error) ${e.message}`);
      }
    }

    const stgRes = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'stg_%' ORDER BY table_name");
    const stgTables = stgRes.rows.map(r=>r.table_name);
    console.log('\nStaging tables counts:');
    for(const t of stgTables){
      try{
        const r = await pool.query(`SELECT COUNT(*)::int AS c FROM "${t}"`);
        console.log(`${t}: ${r.rows[0].c}`);
      }catch(e){
        console.log(`${t}: (error) ${e.message}`);
      }
    }
  }catch(err){
    console.error('Error', err);
  }finally{
    await pool.end();
  }
}

main();
