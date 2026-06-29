import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
const ROOT = path.resolve(path.join(path.dirname(import.meta.url.replace('file://','')),'..','..'));
const ENV_FILE = path.join(ROOT,'backend','.env.local');
const envText = fs.readFileSync(ENV_FILE,'utf8');
const m = envText.match(/^DATABASE_URL=(.+)$/m);
let DB_URL = m[1].trim(); if (DB_URL.startsWith('"') && DB_URL.endsWith('"')) DB_URL = DB_URL.slice(1,-1);
const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });
const schemaPath = path.join(ROOT,'backend','src','db','schema.sql');
(async ()=>{
  const client = await pool.connect();
  try{
    const sql = fs.readFileSync(schemaPath,'utf8');
    console.log('Creating extension pgcrypto if needed');
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
    console.log('Applying schema.sql');
    await client.query(sql);
    console.log('Schema applied');
  }catch(err){ console.error('Error applying schema', err); }
  finally{ client.release(); await pool.end(); }
})();
