import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
const ROOT = path.resolve(path.join(path.dirname(import.meta.url.replace('file://','')),'..','..'));
const ENV_FILE = path.join(ROOT,'backend','.env.local');
const envText = fs.readFileSync(ENV_FILE,'utf8');
const m = envText.match(/^DATABASE_URL=(.+)$/m);
let DB_URL = m[1].trim(); if (DB_URL.startsWith('"') && DB_URL.endsWith('"')) DB_URL = DB_URL.slice(1,-1);
const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } });

function timestamp(){
  const d = new Date();
  const pad = n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

const selectSrc = `WITH src AS (
  SELECT trim(lower(email::text)) as email, NULLIF(username,'') as username, NULLIF(id,'') as legacy_id, NULLIF(display_name,'') as display_name, NULLIF(bio,'') as bio, NULLIF(phone,'') as phone, NULLIF(location,'') as location, NULLIF(website,'') as website, NULLIF(avatar_url,'') as avatar_url, NULLIF(cover_url,'') as cover_url, COALESCE(NULLIF(role,''),'user') as role, COALESCE(NULLIF(verified_status,''),'no') as verified_status, COALESCE(NULLIF(account_status,''),'active') as account_status, (CASE WHEN lower(NULLIF(two_factor_enabled,'')) = 'true' THEN true ELSE false END) as two_factor_enabled, NULLIF(totp_secret,'') as totp_secret, NULLIF(badges,'') as badges_raw, NULLIF(verifications,'') as verifications_raw, NULLIF(notification_prefs,'') as notification_prefs_raw, NULLIF(created_date::text,'') as created_date, NULLIF(updated_date::text,'') as updated_date, 0 as priority FROM stg_user_export
  UNION ALL
  SELECT trim(lower(email::text)) as email, NULL as username, NULL as legacy_id, NULLIF(nom,'') as display_name, '' as bio, NULLIF(t_l_phone,'') as phone, NULLIF(localisation,'') as location, '' as website, '' as avatar_url, '' as cover_url, COALESCE(NULLIF(r_le,''),'user') as role, 'no' as verified_status, COALESCE(NULLIF(statut,''),'active') as account_status, false as two_factor_enabled, NULL as totp_secret, NULLIF(badges,'') as badges_raw, NULL as verifications_raw, NULL as notification_prefs_raw, NULL as created_date, NULL as updated_date, 1 as priority FROM stg_utilisateurs__2_
)
SELECT DISTINCT ON (email) * FROM src ORDER BY email, priority;`;

const upsertSingle = `INSERT INTO users (email, username, legacy_id, display_name, bio, phone, location, website, avatar_url, cover_url, role, verified_status, account_status, two_factor_enabled, totp_secret, badges, verifications, notification_preferences, created_at, updated_at)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username, legacy_id = EXCLUDED.legacy_id, display_name = EXCLUDED.display_name, bio = EXCLUDED.bio, phone = EXCLUDED.phone, location = EXCLUDED.location, website = EXCLUDED.website, avatar_url = EXCLUDED.avatar_url, cover_url = EXCLUDED.cover_url, role = EXCLUDED.role, verified_status = EXCLUDED.verified_status, account_status = EXCLUDED.account_status, two_factor_enabled = EXCLUDED.two_factor_enabled, totp_secret = EXCLUDED.totp_secret, badges = EXCLUDED.badges, verifications = EXCLUDED.verifications, notification_preferences = EXCLUDED.notification_preferences, updated_at = now();`;

(async ()=>{
  const client = await pool.connect();
  const ts = timestamp();
  const backupTable = `users_backup_${ts}`;
  try{
    await client.query('BEGIN');
    console.log('Creating in-DB backup table', backupTable);
    await client.query(`CREATE TABLE IF NOT EXISTS ${backupTable} AS TABLE users WITH NO DATA`);
    await client.query(`INSERT INTO ${backupTable} SELECT * FROM users`);
    console.log('Backup created');

    const srcRes = await client.query(selectSrc);
    console.log('Rows to upsert:', srcRes.rows.length);
    for(const r of srcRes.rows){
      const badges = (r.badges_raw==null||r.badges_raw==='') ? [] : (function(s){ const rep = s.replace(/\[|\]|\"/g,''); return rep===''?[]:rep.split(','); })(r.badges_raw);
      const verifs = (r.verifications_raw==null||r.verifications_raw==='') ? [] : (function(s){ const rep = s.replace(/\[|\]|\"/g,''); return rep===''?[]:rep.split(','); })(r.verifications_raw);
      const notif = (r.notification_prefs_raw==null||r.notification_prefs_raw==='') ? {} : JSON.parse(r.notification_prefs_raw);
      const created_at = (r.created_date==null||r.created_date==='') ? new Date() : new Date(r.created_date);
      const updated_at = (r.updated_date==null||r.updated_date==='') ? new Date() : new Date(r.updated_date);
      const username = r.username || (r.email? r.email.split('@')[0] : null);
      const vals = [r.email, username, r.display_name||null, r.bio||null, r.phone||null, r.location||null, r.website||null, r.avatar_url||null, r.cover_url||null, r.role||'user', r.verified_status||'no', r.account_status||'active', r.two_factor_enabled||false, r.totp_secret||null, badges, verifs, notif, created_at, updated_at];
      try{
        await client.query(upsertSingle, vals);
      }catch(e){ console.error('Error upserting', r.email, e); }
    }
    await client.query('COMMIT');
    const counts = await client.query(`SELECT (SELECT COUNT(*) FROM users)::int as users, (SELECT COUNT(*) FROM stg_user_export)::int as stg_user_export, (SELECT COUNT(*) FROM stg_utilisateurs__2_)::int as stg_utilisateurs__2_;`);
    console.log('Counts after upsert:', counts.rows[0]);
  }catch(err){ console.error('Error, rolling back', err); await client.query('ROLLBACK'); }
  finally{ client.release(); await pool.end(); }
})();
