import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

// Catalogue des actions récompensées — synchronisé avec base44/shared/rewardActions.ts
export const REWARD_ACTIONS = {
  daily_login:      { credits: 5,  dailyCap: 1,  label: 'Connexion quotidienne',  description: 'Connectez-vous chaque jour' },
  create_post:      { credits: 10, dailyCap: 5,  label: 'Publication',            description: 'Publiez un post dans le fil' },
  create_reply:     { credits: 3,  dailyCap: 20, label: 'Réponse',                description: 'Répondez à une publication' },
  like_post:        { credits: 1,  dailyCap: 30, label: 'J\'aime',                description: 'Aimez les publications' },
  follow_user:      { credits: 2,  dailyCap: 20, label: 'Abonnement',              description: 'Suivez un autre utilisateur' },
  create_community: { credits: 15, dailyCap: 3,  label: 'Création de communauté',  description: 'Créez une communauté' },
  join_community:   { credits: 5,  dailyCap: 10, label: 'Communauté rejointe',     description: 'Rejoignez une communauté' },
  create_space:     { credits: 15, dailyCap: 3,  label: 'Space lancé',             description: 'Démarrez un Space audio' },
  create_discussion:{ credits: 8,  dailyCap: 10, label: 'Sujet forum',             description: 'Ouvrez un sujet de discussion' },
  share_post:       { credits: 2,  dailyCap: 15, label: 'Partage',                 description: 'Partagez une publication' },
};

export const REWARD_ACTION_LIST = Object.entries(REWARD_ACTIONS).map(([key, val]) => ({
  key,
  ...val,
}));

// Appelle la fonction backend pour créditer l'utilisateur.
// Affiche un toast de confirmation si des crédits sont accordés.
// Silent en cas d'échec — ne bloque jamais l'action de l'utilisateur.
export async function awardCredits(action, metadata = {}, { silent = false } = {}) {
  try {
    const res = await base44.functions.invoke('awardActionCredits', { action, metadata });
    const data = res?.data || res;
    if (data?.success && data.awarded > 0 && !silent) {
      toast.success(`+${data.awarded} crédits Eza`, {
        description: data.label,
        icon: '✨',
        duration: 3500,
      });
    }
    return data;
  } catch {
    return { success: false, awarded: 0 };
  }
}

// Bonus de connexion quotidienne — à appeler au démarrage de l'app.
export async function awardDailyLogin() {
  try {
    const authed = await base44.auth.isAuthenticated();
    if (!authed) return;
    await awardCredits('daily_login', {}, { silent: false });
  } catch {}
}