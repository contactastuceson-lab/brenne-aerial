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
    const sp = await client.query("SHOW search_path");
    console.log('search_path =', sp.rows[0].search_path);
    const res = await client.query("SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY schemaname, tablename");
    console.log('tables:');
    for(const r of res.rows) console.log(r.schemaname + '.' + r.tablename);
  }catch(err){ console.error(err); }
  finally{ client.release(); await pool.end(); }
})();
