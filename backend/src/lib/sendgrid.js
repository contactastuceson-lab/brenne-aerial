import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

dotenv.config({ path: '.env.local' });

const apiKey = process.env.SENDGRID_API_KEY;

if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const senderNamesByType = {
  verification: 'Vérification Brenne Aerial',
  contact: 'Mail contact Brenne Aerial',
  support: 'Support Brenne Aerial',
  reset_password: 'Réinitialisation Brenne Aerial',
  notification: 'Notification Brenne Aerial',
  marketing: 'Brenne Aerial News',
  default: process.env.EMAIL_FROM_NAME || 'Brenne Aerial France',
};

const getSenderName = (emailType) => {
  if (!emailType) {
    return senderNamesByType.default;
  }

  return senderNamesByType[emailType] || senderNamesByType.default;
};

export const sendEmail = async ({ to, subject, text, html, from, emailType }) => {
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not configured');
  }

  const defaultFromEmail = process.env.EMAIL_FROM || 'no-reply@brenneaerial.fr';
  const defaultFromName = getSenderName(emailType);

  const normalizedFrom = typeof from === 'string'
    ? { email: from, name: defaultFromName }
    : {
      email: from?.email || defaultFromEmail,
      name: from?.name || defaultFromName,
    };

  const msg = {
    to,
    from: normalizedFrom,
    subject,
    text,
    html,
  };

  return sgMail.send(msg);
};

export default sgMail;
