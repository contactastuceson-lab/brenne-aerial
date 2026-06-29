import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// ============ OPTION 1: Firebase ID Token Verification ============
export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    req.user.id = decodedToken.uid; // Normaliser l'ID
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid Firebase token' });
  }
};

// ============ OPTION 2: JWT Custom Verification ============
export const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ GÉNÉRER JWT ============
export const generateJWT = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      username: user.username
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ============ AUTHENTIFICATION OPTIONNELLE ============
export const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Ignorer l'erreur, continuer anonyme
    }
  }

  next();
};

// ============ ADMIN ONLY ============
export const requireAdmin = (req, res, next) => {
  if (!req.user || !['admin', 'owner'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// ============ OWNER ONLY ============
export const requireOwner = (req, res, next) => {
  if (!req.user || req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Owner access required' });
  }
  next();
};
