import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import { sendEmail } from './lib/sendgrid.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE GLOBAL ============
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Trop de requêtes, essayez plus tard'
});
app.use('/api/', limiter);

// ============ ROUTES ============
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'Brenne Aerial Backend',
    version: '1.0.0',
    endpoints: {
      auth: [
        'POST /api/auth/signup',
        'POST /api/auth/login',
        'POST /api/auth/verify-token',
        'GET /api/auth/me',
        'POST /api/auth/logout'
      ],
      users: [
        'GET /api/users/me',
        'GET /api/users/:username',
        'PUT /api/users/me',
        'GET /api/users (admin)'
      ]
    }
  });
});

app.post('/api/test-email', async (req, res) => {
  try {
    const { to, subject = 'Test email', text = 'Bonjour !' } = req.body;

    if (!to) {
      return res.status(400).json({ error: 'to is required' });
    }

    await sendEmail({
      to,
      subject,
      text,
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email send failed:', error);
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 Brenne Aerial Backend              ║
║  Server running on port ${PORT}        ║
║  Environment: ${process.env.NODE_ENV}                   ║
║  Frontend: ${process.env.FRONTEND_URL}      ║
╚════════════════════════════════════════╝
  `);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

export default app;
