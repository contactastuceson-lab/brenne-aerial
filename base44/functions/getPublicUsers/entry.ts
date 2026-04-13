import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Use service role to list all users (bypasses User entity security rules)
  const users = await base44.asServiceRole.entities.User.list();

  // Return only public profile fields
  const publicUsers = users.map(u => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    role: u.role,
    avatar_url: u.avatar_url || null,
    cover_url: u.cover_url || null,
    bio: u.bio || null,
    location: u.location || null,
    badges: u.badges || [],
    verifications: u.verifications || [],
    verified_status: u.verified_status || 'no',
    account_status: u.account_status || 'active',
    last_seen: u.last_seen || null,
  }));

  // Filter out banned/suspended users from public view
  const visible = publicUsers.filter(u => !['banned', 'suspended'].includes(u.account_status));

  return Response.json({ users: visible });
});