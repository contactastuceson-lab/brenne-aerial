import express from 'express';
import { pool } from '../db/pool.js';
import { verifyFirebaseToken, optionalAuth, requireAdmin } from '../auth/middleware.js';

const router = express.Router();

// GET /api/users/me (Profil courant)
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, username, display_name, bio, phone, location, website, 
              avatar_url, cover_url, role, verified_status, badges, created_at 
       FROM users WHERE email = $1`,
      [req.user.email]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:username (Profil public)
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, display_name, bio, avatar_url, cover_url, 
              role, verified_status, badges FROM users WHERE username = $1`,
      [req.params.username]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/me (Mettre à jour profil)
router.put('/me', verifyFirebaseToken, async (req, res) => {
  const { display_name, bio, phone, location, website, avatar_url, cover_url } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET display_name = COALESCE($1, display_name),
           bio = COALESCE($2, bio),
           phone = COALESCE($3, phone),
           location = COALESCE($4, location),
           website = COALESCE($5, website),
           avatar_url = COALESCE($6, avatar_url),
           cover_url = COALESCE($7, cover_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE email = $8
       RETURNING id, email, username, display_name, bio, phone, location, website, avatar_url, cover_url, role`,
      [display_name, bio, phone, location, website, avatar_url, cover_url, req.user.email]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users (List all - Admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, display_name, role, verified_status, created_at 
       FROM users ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
