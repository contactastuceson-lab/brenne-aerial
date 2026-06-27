import { base44 } from '@/api/base44Client';

export async function createAffiliationNotification({ userEmail, title, content, type = 'system', link = '' }) {
  try {
    await base44.entities.Notification.create({
      user_email: userEmail,
      title,
      content,
      type,
      link,
      is_read: false,
    });
  } catch (error) {
    console.error('affiliation notification failed', error);
  }
}

export async function notifyAffiliationInvitation({ targetEmail, organizationName, invitationId }) {
  await createAffiliationNotification({
    userEmail: targetEmail,
    title: `Invitation de ${organizationName}`,
    content: `Vous avez reçu une invitation à rejoindre ${organizationName}.`,
    type: 'system',
    link: `/espace-client?tab=affiliations&invitation=${invitationId}`,
  });
}

export async function notifyAffiliationStatus({ targetEmail, organizationName, status }) {
  const titles = {
    accepted: `Affiliation acceptée`,
    rejected: `Invitation refusée`,
    removed: `Affiliation retirée`,
    role_changed: `Rôle mis à jour`,
  };
  const contents = {
    accepted: `Votre affiliation avec ${organizationName} a été acceptée.`,
    rejected: `Votre invitation de ${organizationName} a été refusée.`,
    removed: `Votre affiliation avec ${organizationName} a été retirée.`,
    role_changed: `Votre rôle chez ${organizationName} a été mis à jour.`,
  };

  await createAffiliationNotification({
    userEmail: targetEmail,
    title: titles[status] || 'Mise à jour affiliation',
    content: contents[status] || 'Une mise à jour de votre affiliation est disponible.',
    type: 'system',
    link: '/espace-client?tab=affiliations',
  });
}
