import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { username } = await req.json();

    if (!username || username.length < 3) {
      return Response.json({ available: false }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Check if username already exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ username });

    return Response.json({
      available: existingUsers.length === 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});