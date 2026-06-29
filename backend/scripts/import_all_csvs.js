import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { parse as csvParse } from 'csv-parse/sync';

const ROOT = path.resolve(path.join(path.dirname(import.meta.url.replace('file://','')),'..','..'));
const ENV_FILE = path.join(ROOT,'backend','.env.local');
const SCHEMA_FILE = path.join(ROOT,'backend','src','db','schema.sql');

if (!fs.existsSync(ENV_FILE)) throw new Error('backend/.env.local not found');
if (!fs.existsSync(SCHEMA_FILE)) throw new Error('schema.sql not found');

// load DATABASE_URL only
const envText = fs.readFileSync(ENV_FILE,'utf8');
const m = envText.match(/^DATABASE_URL=(.+)$/m);
if (!m) throw new Error('DATABASE_URL not found in backend/.env.local');
let DB_URL = m[1].trim();
if (DB_URL.startsWith('"') && DB_URL.endsWith('"')) DB_URL = DB_URL.slice(1,-1);

console.log('Using DB:', DB_URL.slice(0,40)+'...');
const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

async function applySchema(){
  const sql = fs.readFileSync(SCHEMA_FILE,'utf8');
  console.log('Applying schema...');
  await pool.query(sql);
}

function listCsvs(){
  const res = [];
  const files = fs.readdirSync(ROOT);
  for(const f of files){
    if (f.toLowerCase().endsWith('.csv')) res.push(path.join(ROOT,f));
  }
  return res;
}

async function importCsv(file){
  console.log('\nImporting', file);
  const data = fs.readFileSync(file,'utf8');
  const records = csvParse(data, {columns:true, skip_empty_lines:true});
  if (records.length === 0){
    console.log('Empty CSV, skipping');
    return;
  }
  const cols = Object.keys(records[0]).map(c=>c.replace(/"/g,'').trim());
  const tblBase = path.basename(file, '.csv').replace(/[^a-zA-Z0-9_]/g,'_').toLowerCase();
  const tbl = `stg_${tblBase}`;
  // build create
  const colDefs = cols.map(c => `"${c.replace(/[^a-zA-Z0-9_]/g,'_').toLowerCase()}" text`).join(', ');
  await pool.query(`DROP TABLE IF EXISTS "${tbl}"`);
  await pool.query(`CREATE TABLE "${tbl}" (${colDefs})`);
  // copy via INSERT batches
  const BATCH = 500;
  for(let i=0;i<records.length;i+=BATCH){
    const batch = records.slice(i,i+BATCH);
    const values = [];
    const params = [];
    let idx = 1;
    for(const row of batch){
      const rowVals = [];
      for(const c of cols){
        const v = row[c]===undefined? null: row[c];
        params.push(v);
        rowVals.push(`$${idx++}`);
      }
      values.push('(' + rowVals.join(',') + ')');
    }
    const q = `INSERT INTO "${tbl}" (${cols.map(c=>`"${c.replace(/[^a-zA-Z0-9_]/g,'_').toLowerCase()}"`).join(',')}) VALUES ${values.join(',')}`;
    await pool.query(q, params);
    console.log(`Inserted ${Math.min(i+BATCH, records.length)}/${records.length}`);
  }
  console.log('Finished', tbl);
}

(async ()=>{
  try{
    await applySchema();
    const csvs = listCsvs();
    console.log('Found', csvs.length, 'CSV files');
    for(const f of csvs){
      try{ await importCsv(f); } catch(e){ console.error('Error importing', f, e.message); }
    }
    console.log('Done all');
  }catch(err){
    console.error('Fatal error', err);
  }finally{
    await pool.end();
  }
})();
