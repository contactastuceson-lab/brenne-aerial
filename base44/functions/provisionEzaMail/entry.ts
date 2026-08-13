import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const EZA_DOMAIN = 'ezagroup.fr';

function cleanPseudo(raw) {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]/g, '')        // remove anything not alphanumeric
    .replace(/^[0-9]+/, '')           // strip leading digits (valid local-part can't start with a digit)
    .substring(0, 32);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // If the user already has an EZA Mail, verify it still exists on the mail side
    // (handles retroactive deletions that happened before the syncEzaMailDeletion webhook existed)
    if (user.eza_mail) {
      const verifyUrl = secrets.get('EZA_MAIL_VERIFY_URL');
      if (verifyUrl) {
        const mailKey = secrets.get('EZA_MAIL_API_KEY');
        try {
          const vRes = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(mailKey ? { 'x-api-key': mailKey } : {}) },
            body: JSON.stringify({ email: user.eza_mail }),
          });
          if (vRes.ok) {
            const vData = await vRes.json().catch(() => ({}));
            if (vData && vData.exists === false) {
              // Mailbox was deleted on the mail side — clear the local field
              try { await base44.asServiceRole.entities.User.update(user.id, { eza_mail: '' }); } catch (e) {}
              return Response.json({ eza_mail: null, deleted: true });
            }
          }
        } catch (e) {
          // Verify endpoint unavailable — keep existing address
        }
      }
      return Response.json({ eza_mail: user.eza_mail, already_provisioned: true });
    }

    // Derive pseudo: prefer username, else email prefix
    const source = (user.username && user.username.trim()) || (user.email ? user.email.split('@')[0] : '');
    const pseudo = cleanPseudo(source);
    if (!pseudo) return Response.json({ error: 'Impossible de générer un pseudo valide' }, { status: 400 });

    const ezaMail = `${pseudo}@${EZA_DOMAIN}`;

    // Call the EZA Mail app (other app in the workspace) to provision the mailbox (SSO)
    const mailUrl = secrets.get('EZA_MAIL_FUNCTION_URL');
    const mailKey = secrets.get('EZA_MAIL_API_KEY');
    if (!mailUrl) return Response.json({ error: 'EZA_MAIL_FUNCTION_URL non configuré' }, { status: 500 });

    const mailRes = await fetch(mailUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(mailKey ? { 'x-api-key': mailKey } : {}),
      },
      body: JSON.stringify({
        pseudo,
        email: ezaMail,
        user_id: user.id,
        display_name: user.display_name || user.full_name || '',
        sso: true,
      }),
    });

    if (!mailRes.ok) {
      const detail = await mailRes.text().catch(() => '');
      return Response.json({ error: `EZA Mail provisioning failed (${mailRes.status})`, detail }, { status: 502 });
    }

    // Persist the EZA Mail address on the user profile (service role — User entity)
    try {
      await base44.asServiceRole.entities.User.update(user.id, { eza_mail: ezaMail });
    } catch (e) {
      // Best-effort: the mailbox is created, we still return the address so the frontend can persist via updateMe
      return Response.json({ eza_mail: ezaMail, warning: 'Mailbox created but profile update failed' });
    }

    return Response.json({ eza_mail: ezaMail, provisioned: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}