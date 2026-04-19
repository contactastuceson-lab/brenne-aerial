/**
 * Setup 2FA with Email
 */
export async function setup2FAEmail(req, res) {
  const { user_email } = req.body;
  
  // Generate verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Send email with code
  try {
    await sendEmail({
      to: user_email,
      subject: '🔐 Code de vérification 2FA',
      body: `
        <h2>Authentification à deux facteurs</h2>
        <p>Votre code de vérification est: <strong>${code}</strong></p>
        <p>Ce code expire dans 15 minutes</p>
        <p>Si vous n'avez pas demandé cela, ignorez ce message.</p>
      `,
    });
    
    // Store temporary code (in production, use Redis or similar)
    await storeTemporaryCode(user_email, code, 'email', 15 * 60); // 15 min TTL
    
    res.json({ success: true, message: 'Code sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Setup 2FA with SMS
 */
export async function setup2FASMS(req, res) {
  const { user_email, phone_number } = req.body;
  
  // Validate phone
  if (!phone_number || phone_number.length < 10) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  
  // Generate verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    // Send SMS
    await sendSMS({
      to: phone_number,
      message: `Votre code de vérification 2FA: ${code}`,
    });
    
    // Store temporary code
    await storeTemporaryCode(user_email, code, 'sms', 15 * 60);
    
    res.json({ success: true, message: 'SMS sent' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Setup 2FA with TOTP (Authenticator app)
 */
export async function setup2FATOMTP(req, res) {
  const { user_email } = req.body;
  
  try {
    // Generate TOTP secret
    const secret = generateSecret();
    const qrCodeUrl = generateQRCode(user_email, secret);
    
    // Store temporary secret
    await storeTemporaryCode(user_email, secret, 'totp', 30 * 60); // 30 min TTL
    
    res.json({ 
      success: true,
      secret,
      qrCodeUrl,
      message: 'Scan QR code with authenticator app' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Verify 2FA code and enable method
 */
export async function verify2FA(req, res) {
  const { user_email, method, code } = req.body;
  
  try {
    // Verify code
    const storedCode = await getTemporaryCode(user_email, method);
    
    if (!storedCode || storedCode !== code) {
      return res.status(400).json({ error: 'Invalid code' });
    }
    
    // Generate backup codes
    const backup_codes = generateBackupCodes(8);
    
    // Create TwoFactorAuth record
    const twoFA = await base44.entities.TwoFactorAuth.create({
      user_email,
      method,
      is_enabled: true,
      is_verified: true,
      totp_secret: method === 'totp' ? encryptSecret(storedCode) : null,
      backup_codes: backup_codes.map(c => encryptCode(c)),
      is_primary: true,
    });
    
    // Log this action
    await logAuditAction({
      user_email,
      action_type: '2fa_enabled',
      description: `Authentification 2FA activée via ${method}`,
      is_sensitive: true,
    });
    
    // Clear temporary code
    await deleteTemporaryCode(user_email, method);
    
    res.json({ 
      success: true,
      backup_codes, // Return unencrypted for user to save
      message: '2FA enabled successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Helper functions (stubs - implement with your backend)
async function sendEmail({ to, subject, body }) {
  // Implement with your email service (SendGrid, etc.)
  console.log(`Email to ${to}:`, body);
}

async function sendSMS({ to, message }) {
  // Implement with your SMS service (Twilio, etc.)
  console.log(`SMS to ${to}:`, message);
}

function generateSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
}

function generateQRCode(email, secret) {
  // Use qrcode library to generate QR code
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Brenne%20Aerial%3A${email}?secret=${secret}`;
}

function generateBackupCodes(count) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
  }
  return codes;
}

function encryptSecret(secret) {
  // Use encryption library
  return Buffer.from(secret).toString('base64');
}

function encryptCode(code) {
  return Buffer.from(code).toString('base64');
}

async function storeTemporaryCode(email, code, method, ttl) {
  // Store in Redis or similar with TTL
  // For now, using in-memory storage
  global.tempCodes = global.tempCodes || {};
  global.tempCodes[`${email}_${method}`] = { code, expires: Date.now() + ttl * 1000 };
}

async function getTemporaryCode(email, method) {
  const key = `${email}_${method}`;
  if (!global.tempCodes || !global.tempCodes[key]) return null;
  
  const entry = global.tempCodes[key];
  if (Date.now() > entry.expires) {
    delete global.tempCodes[key];
    return null;
  }
  
  return entry.code;
}

async function deleteTemporaryCode(email, method) {
  const key = `${email}_${method}`;
  if (global.tempCodes) {
    delete global.tempCodes[key];
  }
}

async function logAuditAction({ user_email, action_type, description, is_sensitive }) {
  await base44.entities.AuditLog.create({
    user_email,
    action_type,
    description,
    timestamp: new Date().toISOString(),
    is_sensitive: is_sensitive || false,
    status: 'success',
  });
}
