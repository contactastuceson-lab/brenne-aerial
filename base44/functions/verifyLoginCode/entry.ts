import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function base32Decode(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  str = str.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const output = [];
  for (let i = 0; i < str.length; i++) {
    const idx = alphabet.indexOf(str[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(output);
}

async function checkTOTP(secret, code) {
  const keyBytes = base32Decode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const now = Math.floor(Date.now() / 1000 / 30);
  for (let delta = -1; delta <= 1; delta++) {
    const counter = now + delta;
    const buf = new ArrayBuffer(8);
    new DataView(buf).setUint32(4, counter, false);
    const sig = await crypto.subtle.sign('HMAC', key, buf);
    const bytes = new Uint8Array(sig);
    const offset = bytes[bytes.length - 1] & 0x0f;
    const otp = (
      ((bytes[offset] & 0x7f) << 24) |
      ((bytes[offset + 1] & 0xff) << 16) |
      ((bytes[offset + 2] & 0xff) << 8) |
      (bytes[offset + 3] & 0xff)
    ) % 1000000;
    if (otp.toString().padStart(6, '0') === code) return true;
  }
  return false;
}

const LOGO_URL = 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/6de51adde_1775602844308.png';

function buildLoginAlertEmail(userName, deviceInfo) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Nouvelle connexion détectée</title></head>
<body style="margin:0;padding:0;background:#0a1120;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="background:#0d1a2e;border-radius:16px 16px 0 0;padding:32px 40px 24px;border-bottom:1px solid #1e3048;">
          <img src="${LOGO_URL}" width="90" alt="Brenne Aerial" style="display:block;margin:0 auto 12px;border-radius:50%;" />
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#3ab0dc;font-weight:700;text-transform:uppercase;">Brenne Aerial — Sécurité</p>
        </td></tr>
        <tr><td style="background:#0f1f36;padding:40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:14px;color:#4a6a8a;">Bonjour ${userName},</p>
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#e8f4fc;">Nouvelle connexion vérifiée</h1>
          <p style="margin:0 0 32px;font-size:14px;color:#8aaec8;line-height:1.7;">Une connexion à votre compte a été vérifiée depuis un nouvel appareil : <strong style="color:#e8f4fc;">${deviceInfo}</strong>. Si ce n'est pas vous, changez votre mot de passe immédiatement.</p>
          <p style="margin:0;font-size:12px;color:#3a5a7a;">Si c'est bien vous, vous pouvez ignorer cet e-mail.</p>
        </td></tr>
        <tr><td align="center" style="background:#0d1a2e;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid #1e3048;">
          <p style="margin:0;font-size:12px;color:#4a6a8a;">© 2026 Brenne Aerial · <a href="mailto:contact@brenneaerial.fr" style="color:#3ab0dc;text-decoration:none;">contact@brenneaerial.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildLoginCodeEmail(userName, code) {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Code de connexion</title></head>
<body style="margin:0;padding:0;background:#0a1120;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1120;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td align="center" style="background:#0d1a2e;border-radius:16px 16px 0 0;padding:32px 40px 24px;border-bottom:1px solid #1e3048;">
          <img src="${LOGO_URL}" width="90" alt="Brenne Aerial" style="display:block;margin:0 auto 12px;border-radius:50%;" />
          <p style="margin:0;font-size:11px;letter-spacing:3px;color:#3ab0dc;font-weight:700;text-transform:uppercase;">Brenne Aerial — Connexion sécurisée</p>
        </td></tr>
        <tr><td style="background:#0f1f36;padding:40px;text-align:center;">
          <p style="margin:0 0 8px;font-size:14px;color:#4a6a8a;">Bonjour ${userName},</p>
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#e8f4fc;">Votre code de connexion</h1>
          <p style="margin:0 0 32px;font-size:14px;color:#8aaec8;line-height:1.7;">Une connexion depuis un nouvel appareil a été détectée. Utilisez ce code pour confirmer votre identité. Valable <strong style="color:#e8f4fc;">10 minutes</strong>.</p>
          <div style="display:inline-block;background:#1a3050;border:2px solid #3ab0dc;border-radius:16px;padding:24px 48px;margin:0 0 32px;">
            <span style="font-size:40px;font-weight:900;letter-spacing:12px;color:#3ab0dc;font-family:monospace;">${code}</span>
          </div>
          <p style="margin:0;font-size:12px;color:#3a5a7a;">Si vous n'êtes pas à l'origine de cette tentative, ignorez cet e-mail et sécurisez votre compte.</p>
        </td></tr>
        <tr><td align="center" style="background:#0d1a2e;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid #1e3048;">
          <p style="margin:0;font-size:12px;color:#4a6a8a;">© 2026 Brenne Aerial · <a href="mailto:contact@brenneaerial.fr" style="color:#3ab0dc;text-decoration:none;">contact@brenneaerial.fr</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { action, code, fingerprint, device_name } = body;

    // Check if this device fingerprint is already trusted
    const TRUSTED_KEY = `trusted_device_${fingerprint}`;
    const isTrusted = fingerprint && user[TRUSTED_KEY] === 'true';

    // Action: check if verification is needed for this device
    if (action === 'check_needed') {
      if (!fingerprint) return Response.json({ needed: true, method: user.two_factor_enabled ? 'totp' : 'email' });
      if (isTrusted) return Response.json({ needed: false });
      return Response.json({ needed: true, method: user.two_factor_enabled ? 'totp' : 'email' });
    }

    // Action: send email code (when 2FA not enabled)
    if (action === 'send_email_code') {
      const loginCode = String(Math.floor(100000 + Math.random() * 900000));
      const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await base44.auth.updateMe({
        login_code: loginCode,
        login_code_expires: String(expires),
      });
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: '🔐 Code de connexion Brenne Aerial',
        body: buildLoginCodeEmail(user.full_name || 'cher utilisateur', loginCode),
      });
      return Response.json({ success: true });
    }

    // Action: verify TOTP code
    if (action === 'verify_totp') {
      if (!user.two_factor_enabled || !user.totp_secret) {
        return Response.json({ error: '2FA non activée' }, { status: 400 });
      }
      const valid = await checkTOTP(user.totp_secret, code);
      if (!valid) return Response.json({ valid: false, error: 'Code invalide' }, { status: 400 });
      
      // Mark device as trusted
      if (fingerprint) {
        const update = {};
        update[`trusted_device_${fingerprint}`] = 'true';
        await base44.auth.updateMe(update);
      }

      // Send alert email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: '✅ Nouvelle connexion vérifiée — Brenne Aerial',
        body: buildLoginAlertEmail(user.full_name || 'cher utilisateur', device_name || 'appareil inconnu'),
      });

      return Response.json({ valid: true });
    }

    // Action: verify email code
    if (action === 'verify_email_code') {
      if (!user.login_code || !user.login_code_expires) {
        return Response.json({ error: 'Aucun code en attente' }, { status: 400 });
      }
      if (Date.now() > parseInt(user.login_code_expires)) {
        return Response.json({ error: 'Code expiré', expired: true }, { status: 400 });
      }
      if (user.login_code !== code) {
        return Response.json({ valid: false, error: 'Code invalide' }, { status: 400 });
      }

      // Mark device as trusted and clear login code
      const update = { login_code: null, login_code_expires: null };
      if (fingerprint) {
        update[`trusted_device_${fingerprint}`] = 'true';
      }
      await base44.auth.updateMe(update);

      // Send alert email
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: user.email,
        subject: '✅ Nouvelle connexion vérifiée — Brenne Aerial',
        body: buildLoginAlertEmail(user.full_name || 'cher utilisateur', device_name || 'appareil inconnu'),
      });

      return Response.json({ valid: true });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});