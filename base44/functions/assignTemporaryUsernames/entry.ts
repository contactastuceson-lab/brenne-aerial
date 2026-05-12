import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin only
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    let updated = 0;
    
    // Process users without username
    for (const u of allUsers) {
      if (!u.username) {
        // Generate temporary username: temp_<email_prefix>_<random>
        const emailPrefix = u.email.split('@')[0];
        const random = Math.random().toString(36).substring(2, 8);
        const tempUsername = `temp_${emailPrefix}_${random}`;
        
        await base44.asServiceRole.entities.User.update(u.id, {
          username: tempUsername
        });
        
        updated++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `${updated} users updated with temporary usernames` 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});