import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { announcementId } = await req.json();
    if (!announcementId) {
      return Response.json({ error: 'Missing announcementId' }, { status: 400 });
    }

    // Get the announcement
    const ann = await base44.entities.Announcement.filter({ id: announcementId });
    if (!ann.length) {
      return Response.json({ error: 'Announcement not found' }, { status: 404 });
    }

    const announcement = ann[0];

    // Get all users via admin function
    const users = await base44.functions.invoke('getAdminUsers', {});
    
    // Send email to all users
    await Promise.all(
      users.map(u =>
        base44.integrations.Core.SendEmail({
          to: u.email,
          from_name: 'Brenne Aerial',
          subject: `📢 ${announcement.title || 'Nouvelle annonce'}`,
          body: `
<div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a1628; color: #e8edf5; border-radius: 12px; overflow: hidden;">
  <div style="background: linear-gradient(135deg, #1a6fa8, #0e5a8a); padding: 32px 36px;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px;">📢 ${announcement.title || 'Nouvelle annonce'}</h1>
  </div>
  <div style="padding: 32px 36px; background: #0d1f35;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #c8d8e8;">${announcement.content.replace(/\n/g, '<br>')}</p>
    ${announcement.link_url ? `<a href="${announcement.link_url}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #1a6fa8, #0e5a8a); color: #fff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px;">${announcement.link_label || 'En savoir plus'}</a>` : ''}
  </div>
  <div style="padding: 16px 36px; background: #060e1a; text-align: center;">
    <p style="margin: 0; font-size: 11px; color: rgba(255,255,255,0.2);">Brenne Aerial • ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>
</div>`,
        })
      )
    );

    return Response.json({ success: true, sentTo: users.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});