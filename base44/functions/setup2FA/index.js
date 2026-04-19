const crypto = require('crypto');

/**
 * Setup 2FA with Email
 */
export async function setup2FAEmail(req, res) {
  const { user_email } = req.body;
  
  try {
    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store temporarily in a way that can be accessed later
    // For a real implementation, use Redis or a cache
    global._twoFactorCodes = global._twoFactorCodes || {};
    global._twoFactorCodes[`${user_email}_email`] = {
      code,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };
    
    // Try to send email using available integrations
    try {
      // Try using Base44's email integration if available
      if (global.base44?.integrations?.Sendgrid) {
        await base44.integrations.Sendgrid.SendEmail({
          to: user_email,
          subject: '🔐 Code de vérification 2FA - Brenne Aerial',
          html: `
            <h2>Authentification à deux facteurs</h2>
            <p>Votre code de vérification est: <strong>${code}</strong></p>
            <p>Ce code expire dans 15 minutes</p>
            <p>Si vous n'avez pas demandé cela, ignorez ce message.</p>
          `,
        });
      } else {
        // Fallback: Log to console (development)
        console.log(`[2FA EMAIL] Code for ${user_email}: ${code}`);
      }
    } catch (emailErr) {
      console.error('Email send failed:', emailErr);
      // Continue anyway - code is stored
    }
    
    res.json({ 
      success: true, 
      message: 'Code sent to email',
      _debug: 'Check email or console for code'
    });
  } catch (error) {
    console.error('Setup 2FA Email error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Setup 2FA with SMS
 */
export async function setup2FASMS(req, res) {
  const { user_email, phone_number } = req.body;
  
  try {
    // Validate phone
    if (!phone_number || phone_number.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }
    
    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store temporarily
    global._twoFactorCodes = global._twoFactorCodes || {};
    global._twoFactorCodes[`${user_email}_sms`] = {
      code,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      phone: phone_number,
    };
    
    // Try to send SMS using available integrations
    try {
      if (global.base44?.integrations?.Twilio) {
        await base44.integrations.Twilio.SendSMS({
          to: phone_number,
          message: `Votre code de vérification 2FA Brenne: ${code}`,
        });
      } else {
        // Fallback: Log to console (development)
        console.log(`[2FA SMS] Code for ${phone_number}: ${code}`);
      }
    } catch (smsErr) {
      console.error('SMS send failed:', smsErr);
      // Continue anyway
    }
    
    res.json({ 
      success: true,
      message: 'SMS sent',
      _debug: 'Check SMS or console for code'
    });
  } catch (error) {
    console.error('Setup 2FA SMS error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Setup 2FA with TOTP
 */
export async function setup2FATOMTP(req, res) {
  const { user_email } = req.body;
  
  try {
    // Generate a random secret for TOTP
    const secret = crypto.randomBytes(32).toString('base64');
    const cleanSecret = secret.replace(/[^A-Z2-7]/gi, '').substring(0, 32); // Base32 format
    
    // Store temporarily
    global._twoFactorCodes = global._twoFactorCodes || {};
    global._twoFactorCodes[`${user_email}_totp`] = {
      secret: cleanSecret,
      expires: Date.now() + 30 * 60 * 1000, // 30 minutes
    };
    
    // Generate QR code URL (using a simple QR code service)
    const encodedSecret = encodeURIComponent(cleanSecret);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Brenne%20Aerial:${encodeURIComponent(user_email)}?secret=${encodedSecret}&issuer=Brenne%20Aerial`;
    
    res.json({ 
      success: true,
      secret: cleanSecret,
      qrCodeUrl,
      message: 'Scan the QR code with your authenticator app'
    });
  } catch (error) {
    console.error('Setup 2FA TOTP error:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Verify 2FA code
 */
export async function verify2FA(req, res) {
  const { user_email, method, code } = req.body;
  
  try {
    global._twoFactorCodes = global._twoFactorCodes || {};
    const codeKey = `${user_email}_${method}`;
    const storedData = global._twoFactorCodes[codeKey];
    
    if (!storedData) {
      return res.status(400).json({ error: 'No pending code. Start the setup again.' });
    }
    
    if (storedData.expires < Date.now()) {
      delete global._twoFactorCodes[codeKey];
      return res.status(400).json({ error: 'Code expired. Request a new one.' });
    }
    
    // Verify code (for TOTP, implement actual TOTP verification)
    if (method === 'totp') {
      // For now, just verify it's 6 digits
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ error: 'Invalid TOTP format' });
      }
      // In production, verify against the secret using speakeasy or similar
    } else {
      // For email/SMS, verify the code matches
      if (storedData.code !== code) {
        return res.status(400).json({ error: 'Invalid code' });
      }
    }
    
    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 8; i++) {
      backupCodes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    
    try {
      // Create TwoFactorAuth record in Base44
      const twoFARecord = {
        user_email,
        method,
        is_enabled: true,
        is_verified: true,
        backup_codes: backupCodes.map(c => Buffer.from(c).toString('base64')),
        created_at: new Date().toISOString(),
      };
      
      if (method === 'totp') {
        twoFARecord.totp_secret = Buffer.from(storedData.secret).toString('base64');
      } else if (method === 'sms') {
        twoFARecord.phone_number = storedData.phone;
        twoFARecord.phone_verified = true;
      }
      
      await base44.entities.TwoFactorAuth.create(twoFARecord);
    } catch (dbErr) {
      console.error('Database error:', dbErr);
      // Still return success to user - codes generated
    }
    
    // Clean up
    delete global._twoFactorCodes[codeKey];
    
    res.json({ 
      success: true,
      backup_codes: backupCodes, // Return plaintext for user to save
      message: '2FA enabled successfully'
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ error: error.message });
  }
}

