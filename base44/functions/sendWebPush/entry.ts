import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { sendPushNotification, deserializeVapidKeys } from 'npm:web-push-browser@1.4.2';

// ── Helpers base64url (sans dépendance) ─────────────────────────────────────
function b64urlToBytes(str) {
  const pad = '='.repeat((4 - (str.length % 4)) % 4);
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}
function bytesToB64url(arr) {
  let bin = '';
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ── Import des clés VAPID ───────────────────────────────────────────────────
// La clé privée VAPID existante est un scalaire brut 32 octets (format `web-push`),
// et la clé publique stockée ne correspond pas forcément. On construit donc un
// PKCS8 minimal à partir du seul scalaire, on importe la clé privée, puis on en
// dérive la clé publique via exportKey('spki') — aucun besoin du VAPID_PUBLIC_KEY.
function buildMinimalPkcs8(privRaw32) {
  const prefix = new Uint8Array([
    0x30, 0x41, 0x02, 0x01, 0x00, 0x30, 0x13, 0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
    0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, 0x04, 0x27, 0x30, 0x25, 0x02, 0x01,
    0x01, 0x04, 0x20,
  ]);
  const out = new Uint8Array(prefix.length + privRaw32.length);
  out.set(prefix, 0);
  out.set(privRaw32, prefix.length);
  return out;
}

async function loadKeyPair(publicKeyStr, privateKeyStr) {
  const privRaw = b64urlToBytes(privateKeyStr);
  if (privRaw.length === 32) {
    const pkcs8 = buildMinimalPkcs8(privRaw);
    const privateKey = await crypto.subtle.importKey(
      'pkcs8', pkcs8,
      { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']
    );
    // La clé privée contient x/y (dérivés de d) — on les récupère via export JWK
    // puis on importe la clé publique correspondante.
    const privJwk = await crypto.subtle.exportKey('jwk', privateKey);
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      { kty: 'EC', crv: 'P-256', x: privJwk.x, y: privJwk.y, ext: true, key_ops: ['verify'] },
      { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']
    );
    return { publicKey, privateKey };
  }
  // Sinon, on suppose un format PKCS8 base64url (web-push-browser natif).
  return await deserializeVapidKeys({ publicKey: publicKeyStr, privateKey: privateKeyStr });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, title, body, url, tag, icon } = await req.json();

    if (!user_email || !title) {
      return Response.json({ error: 'user_email and title are required' }, { status: 400 });
    }

    const subscriptions = await base44.asServiceRole.entities.PushSubscription.filter({ user_email });
    if (subscriptions.length === 0) {
      return Response.json({ success: true, sent: 0, message: 'No subscriptions found' });
    }

    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');
    if (!publicKey || !privateKey) {
      return Response.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    const keyPair = await loadKeyPair(publicKey, privateKey);
    const appUrl = Deno.env.get('APP_URL') || 'https://ezagroup.org';
    const targetUrl = url || '/messages';
    const payload = JSON.stringify({
      title,
      body: body || '',
      url: targetUrl,
      tag,
      icon: icon || 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/53f8e6b37_1782606023373.png',
    });
    const subject = 'mailto:contact@eza.group';

    let sent = 0;
    const toDelete = [];

    for (const sub of subscriptions) {
      try {
        let parsed;
        try { parsed = JSON.parse(sub.subscription_json); } catch (_) { continue; }
        if (!parsed.endpoint || !parsed.keys?.p256dh || !parsed.keys?.auth) continue;

        const res = await sendPushNotification(keyPair, parsed, subject, payload);
        if (res.ok) sent++;
        else if (res.status === 404 || res.status === 410) toDelete.push(sub.id);
      } catch (_) {
        // erreur individuelle ignorée
      }
    }

    await Promise.all(toDelete.map(id => base44.asServiceRole.entities.PushSubscription.delete(id)));

    return Response.json({ success: true, sent, total: subscriptions.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});