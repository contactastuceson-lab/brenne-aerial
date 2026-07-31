// Catalogue des actions récompensées — partagé entre la fonction backend et le frontend.
// Chaque action définit : credits (montant), dailyCap (limite par jour), label + description.

export interface RewardActionConfig {
  credits: number;
  dailyCap: number;
  label: string;
  description: string;
  icon?: string;
}

export const REWARD_ACTIONS: Record<string, RewardActionConfig> = {
  daily_login:       { credits: 5,  dailyCap: 1,  label: 'Connexion quotidienne',       description: 'Connectez-vous chaque jour' },
  create_post:        { credits: 10, dailyCap: 5,  label: 'Publication',                 description: 'Publiez un post dans le fil' },
  create_reply:       { credits: 3,  dailyCap: 20, label: 'Réponse',                     description: 'Répondez à une publication' },
  like_post:          { credits: 1,  dailyCap: 30, label: 'J\'aime',                    description: 'Aimez les publications' },
  follow_user:        { credits: 2,  dailyCap: 20, label: 'Abonnement',                  description: 'Suivez un autre utilisateur' },
  create_community:   { credits: 15, dailyCap: 3,  label: 'Création de communauté',      description: 'Créez une communauté' },
  join_community:     { credits: 5,  dailyCap: 10, label: 'Communauté rejointe',         description: 'Rejoignez une communauté' },
  create_space:       { credits: 15, dailyCap: 3,  label: 'Space lancé',                 description: 'Démarrez un Space audio' },
  create_discussion:  { credits: 8,  dailyCap: 10, label: 'Sujet forum',                 description: 'Ouvrez un sujet de discussion' },
  share_post:         { credits: 2,  dailyCap: 15, label: 'Partage',                     description: 'Partagez une publication' },
};

export function getActionConfig(action: string): RewardActionConfig | null {
  return REWARD_ACTIONS[action] || null;
}

export function isUnderDailyCap(logs: any[], action: string): boolean {
  const config = REWARD_ACTIONS[action];
  if (!config) return false;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayCount = logs.filter(l =>
    l.action === action && l.user_email && new Date(l.created_date) >= todayStart
  ).length;
  return todayCount < config.dailyCap;
}