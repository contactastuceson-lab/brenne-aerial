import express from 'express';
import { pool } from '../db/pool.js';
import { generateJWT, verifyFirebaseToken, optionalAuth } from '../auth/middleware.js';
import { firebaseAuth } from '../auth/firebase.js';

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, username, display_name } = req.body;

  try {
    // Valider les inputs
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username required' });
    }

    // 1. Créer utilisateur dans Firebase
    let firebaseUser;
    try {
      firebaseUser = await firebaseAuth.createUser({
        email,
        password,
        displayName: display_name || username
      });
    } catch (firebaseError) {
      if (firebaseError.code === 'auth/email-already-exists') {
        return res.status(400).json({ error: 'Email already registered' });
      }
      throw firebaseError;
    }

    // 2. Créer utilisateur dans PostgreSQL
    const result = await pool.query(
      `INSERT INTO users 
      (id, email, username, display_name, role) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING id, email, username, display_name, role`,
      [firebaseUser.uid, email, username, display_name || username, 'user']
    );

    const user = result.rows[0];

    // 3. Générer JWT
    const token = generateJWT(user);

    res.status(201).json({
      user,
      token,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, firebaseToken } = req.body;

  try {
    if (!email || !firebaseToken) {
      return res.status(400).json({ error: 'Email and firebaseToken required' });
    }

    // Vérifier le token Firebase
    const decodedToken = await firebaseAuth.verifyIdToken(firebaseToken);

    // Vérifier que l'email correspond
    if (decodedToken.email !== email) {
      return res.status(401).json({ error: 'Token email mismatch' });
    }

    // Récupérer utilisateur PostgreSQL
    const result = await pool.query(
      'SELECT id, email, username, display_name, role, avatar_url, bio FROM users WHERE email = $1',
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'User not registered in app' });
    }

    const user = result.rows[0];
    const token = generateJWT(user);

    res.json({ user, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/verify-token (Exchange Firebase token for JWT)
router.post('/verify-token', verifyFirebaseToken, async (req, res) => {
  try {
    const email = req.user.email;

    // Récupérer utilisateur PostgreSQL
    const result = await pool.query(
      'SELECT id, email, username, display_name, role, avatar_url FROM users WHERE email = $1',
      [email]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not registered' });
    }

    const user = result.rows[0];
    const jwtToken = generateJWT(user);

    res.json({ user, token: jwtToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me (Get current user)
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, display_name, bio, avatar_url, cover_url, role, verified_status FROM users WHERE email = $1',
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

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Client supprime le token du localStorage
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/register-fcm-token
router.post('/register-fcm-token', verifyFirebaseToken, async (req, res) => {
  const { fcmToken } = req.body;

  try {
    if (!fcmToken) {
      return res.status(400).json({ error: 'FCM token required' });
    }

    await pool.query(
      'UPDATE users SET fcm_token = $1 WHERE email = $2',
      [fcmToken, req.user.email]
    );

    res.json({ message: 'FCM token registered' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
