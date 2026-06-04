import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { reportId, reporterName, targetName, targetType, reason } = await req.json();

    // Get all admin users (service role to bypass User entity restrictions)
    const admins = await base44.asServiceRole.entities.User.list();
    const adminEmails = admins
      .filter(u => u.role === 'admin')
      .map(u => u.email);

    if (adminEmails.length === 0) {
      return Response.json({ success: true, notified: 0 });
    }

    // Create notification for each admin
    await Promise.all(
      adminEmails.map(adminEmail =>
        base44.entities.Notification.create({
          user_email: adminEmail,
          type: 'report',
          title: `Nouveau signalement : ${targetName}`,
          message: `${reporterName} a signalé ${targetType === 'user' ? 'un profil' : 'un message'} (${reason})`,
          read: false,
          action_url: '/admin/reports',
          data: { reportId, targetType }
        }).catch(() => {})
      )
    );

    return Response.json({ success: true, notified: adminEmails.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});