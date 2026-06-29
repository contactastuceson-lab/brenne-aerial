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

const UPSERT_SQL = `WITH src AS (
  SELECT trim(lower(email::text)) as email, NULLIF(username,'') as username, NULLIF(display_name,'') as display_name, NULLIF(bio,'') as bio, NULLIF(phone,'') as phone, NULLIF(location,'') as location, NULLIF(website,'') as website, NULLIF(avatar_url,'') as avatar_url, NULLIF(cover_url,'') as cover_url, COALESCE(NULLIF(role,''),'user') as role, COALESCE(NULLIF(verified_status,''),'no') as verified_status, COALESCE(NULLIF(account_status,''),'active') as account_status, (CASE WHEN lower(NULLIF(two_factor_enabled,'')) = 'true' THEN true ELSE false END) as two_factor_enabled, NULLIF(totp_secret,'') as totp_secret, NULLIF(badges,'') as badges_raw, NULLIF(verifications,'') as verifications_raw, NULLIF(notification_prefs,'') as notification_prefs_raw, NULLIF(created_date::text,'') as created_date, NULLIF(updated_date::text,'') as updated_date, 0 as priority FROM stg_user_export
  UNION ALL
  SELECT trim(lower(email::text)) as email, NULL as username, NULLIF(nom,'') as display_name, '' as bio, NULLIF(t_l_phone,'') as phone, NULLIF(localisation,'') as location, '' as website, '' as avatar_url, '' as cover_url, COALESCE(NULLIF(r_le,''),'user') as role, 'no' as verified_status, COALESCE(NULLIF(statut,''),'active') as account_status, false as two_factor_enabled, NULL as totp_secret, NULLIF(badges,'') as badges_raw, NULL as verifications_raw, NULL as notification_prefs_raw, NULL as created_date, NULL as updated_date, 1 as priority FROM stg_utilisateurs__2_
)
 , src_dedup AS (
  SELECT DISTINCT ON (email) * FROM src ORDER BY email, priority
)
INSERT INTO users (email, username, display_name, bio, phone, location, website, avatar_url, cover_url, role, verified_status, account_status, two_factor_enabled, totp_secret, badges, verifications, notification_preferences, created_at, updated_at)
SELECT
  src.email,
  COALESCE(NULLIF(src.username,''), split_part(src.email,'@',1)) as username,
  src.display_name,
  src.bio,
  src.phone,
  src.location,
  src.website,
  src.avatar_url,
  src.cover_url,
  src.role,
  src.verified_status,
  src.account_status,
  src.two_factor_enabled,
  src.totp_secret,
  CASE WHEN src.badges_raw IS NULL OR src.badges_raw = '' THEN '{}'::text[] ELSE (
    CASE WHEN regexp_replace(src.badges_raw, '\\[|\\]|"', '', 'g') = '' THEN '{}'::text[] ELSE string_to_array(regexp_replace(src.badges_raw, '\\[|\\]|"', '', 'g'), ',') END
  ) END,
  CASE WHEN src.verifications_raw IS NULL OR src.verifications_raw = '' THEN '{}'::text[] ELSE (
    CASE WHEN regexp_replace(src.verifications_raw, '\\[|\\]|"', '', 'g') = '' THEN '{}'::text[] ELSE string_to_array(regexp_replace(src.verifications_raw, '\\[|\\]|"', '', 'g'), ',') END
  ) END,
  CASE WHEN src.notification_prefs_raw IS NULL OR src.notification_prefs_raw = '' THEN '{}'::jsonb ELSE src.notification_prefs_raw::jsonb END,
  COALESCE(NULLIF(src.created_date,''), now()::text)::timestamp,
  COALESCE(NULLIF(src.updated_date,''), now()::text)::timestamp
FROM src
ON CONFLICT (email) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  phone = EXCLUDED.phone,
  location = EXCLUDED.location,
  website = EXCLUDED.website,
  avatar_url = EXCLUDED.avatar_url,
  cover_url = EXCLUDED.cover_url,
  role = EXCLUDED.role,
  verified_status = EXCLUDED.verified_status,
  account_status = EXCLUDED.account_status,
  two_factor_enabled = EXCLUDED.two_factor_enabled,
  totp_secret = EXCLUDED.totp_secret,
  badges = EXCLUDED.badges,
  verifications = EXCLUDED.verifications,
  notification_preferences = EXCLUDED.notification_preferences,
  updated_at = now();`;

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

    console.log('Running upsert...');
    const res = await client.query(UPSERT_SQL);
    console.log('Upsert completed');
    await client.query('COMMIT');

    const counts = await client.query(`SELECT (SELECT COUNT(*) FROM users)::int as users, (SELECT COUNT(*) FROM stg_user_export)::int as stg_user_export, (SELECT COUNT(*) FROM stg_utilisateurs__2_)::int as stg_utilisateurs__2_;`);
    console.log('Counts after upsert:', counts.rows[0]);
  }catch(err){
    console.error('Error, rolling back', err);
    await client.query('ROLLBACK');
  }finally{
    client.release();
    await pool.end();
  }
})();
