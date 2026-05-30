import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { username } = await req.json();

    if (!username || username.length < 3) {
      return Response.json({ available: false }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const normalizedUsername = username.toLowerCase();

    // Check if username is taken by an active user
    const existingUsers = await base44.asServiceRole.entities.User.filter({ username: normalizedUsername });
    if (existingUsers.length > 0) {
      return Response.json({ available: false });
    }

    // Check if username is reserved after a deletion
    const reservations = await base44.asServiceRole.entities.DeletedUsername.filter({ username: normalizedUsername });
    if (reservations.length > 0) {
      const reservation = reservations[0];
      const expiresAt = new Date(reservation.expires_at);
      const now = new Date();

      if (expiresAt > now) {
        const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
        return Response.json({
          available: false,
          reserved: true,
          days_left: daysLeft,
          message: `Désolé, ce nom d'utilisateur a été utilisé sur un compte récemment supprimé. Veuillez réessayer avec ce username dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}.`,
        });
      } else {
        // Reservation expired — clean it up
        await base44.asServiceRole.entities.DeletedUsername.delete(reservation.id);
      }
    }

    return Response.json({ available: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});