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
    const staging = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'stg_%' ORDER BY table_name");
    const prod = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    const stgs = staging.rows.map(r=>r.table_name);
    const prods = prod.rows.map(r=>r.table_name);
    console.log('STAGING TABLES:', stgs.join(', '));
    console.log('PRODUCTION TABLES:', prods.join(', '));
    // naive mapping: remove stg_ prefix and try singular/plural heuristics
    const suggestions = [];
    for(const s of stgs){
      const base = s.replace(/^stg_/, '').replace(/_export$/,'');
      const candidates = [base, base+'s', base.replace(/s$/,'')];
      let match = candidates.find(c=>prods.includes(c));
      if(!match){
        // try common synonyms
        const alt = base.replace(/chatmessage/,'messages').replace(/user/,'users').replace(/monitoringlog/,'audit_logs').replace(/notification/,'notifications').replace(/conversationcontrol/,'conversations');
        if(prods.includes(alt)) match = alt;
      }
      suggestions.push({staging:s, suggested: match || null});
    }
    console.log('\nSUGGESTED MAPPING:');
    for(const x of suggestions) console.log(`${x.staging} -> ${x.suggested}`);
  }catch(err){ console.error(err); }
  finally{ client.release(); await pool.end(); }
})();
