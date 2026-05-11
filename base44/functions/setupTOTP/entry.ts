import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Simple TOTP implementation using Web Crypto API
// Generates a secret and a TOTP URI for QR code generation

function base32Encode(buffer) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

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

async function generateTOTP(secret, timeStep = 30) {
  const keyBytes = base32Decode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
  );
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);
  counterView.setUint32(4, counter, false);
  const sig = await crypto.subtle.sign('HMAC', key, counterBuffer);
  const sigBytes = new Uint8Array(sig);
  const offset = sigBytes[sigBytes.length - 1] & 0x0f;
  const code = (
    ((sigBytes[offset] & 0x7f) << 24) |
    ((sigBytes[offset + 1] & 0xff) << 16) |
    ((sigBytes[offset + 2] & 0xff) << 8) |
    (sigBytes[offset + 3] & 0xff)
  ) % 1000000;
  return code.toString().padStart(6, '0');
}

async function generateSecret() {
  const randomBytes = new Uint8Array(20);
  crypto.getRandomValues(randomBytes);
  return base32Encode(randomBytes);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, code, secret: providedSecret } = body;

    if (action === 'generate') {
      // Generate a new TOTP secret for the user
      const secret = await generateSecret();
      const issuer = 'Brenne Aerial';
      const label = encodeURIComponent(`${issuer}:${user.email}`);
      const totpUri = `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
      // QR code via Google Charts API (no key needed)
      const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(totpUri)}`;
      return Response.json({ success: true, secret, totpUri, qrUrl });
    }

    if (action === 'verify') {
      // Verify a TOTP code and enable/disable 2FA
      if (!providedSecret || !code) {
        return Response.json({ error: 'secret et code requis' }, { status: 400 });
      }
      const expected = await generateTOTP(providedSecret);
      // Also check previous and next window for clock drift
      const keyBytes = base32Decode(providedSecret);
      const key = await crypto.subtle.importKey(
        'raw', keyBytes, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
      );
      const now = Math.floor(Date.now() / 1000 / 30);
      let valid = false;
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
        if (otp.toString().padStart(6, '0') === code) {
          valid = true;
          break;
        }
      }
      if (!valid) {
        return Response.json({ valid: false, error: 'Code invalide' }, { status: 400 });
      }
      // Save the secret and enable 2FA
      await base44.auth.updateMe({
        two_factor_enabled: true,
        totp_secret: providedSecret,
      });
      return Response.json({ valid: true, success: true });
    }

    if (action === 'disable') {
      // Disable 2FA
      await base44.auth.updateMe({
        two_factor_enabled: false,
        totp_secret: null,
      });
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Action inconnue' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});