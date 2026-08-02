// Aggregateur de la documentation EZA — conserve l'API publique.
// Le contenu est splité par catégorie pour rester maintenable et riche.
import { plateauTopics } from '@/lib/docs/plateforme';
import { socialTopics } from '@/lib/docs/social';
import { economieTopics } from '@/lib/docs/economie';
import { identiteTopics } from '@/lib/docs/identite';
import { techTopics } from '@/lib/docs/tech';

export const DOC_IMAGES = {
  platform: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/15b445f90_generated_image.png',
  social: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/fc64bbf29_generated_image.png',
  technical: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/ba5be6dc9_generated_image.png',
  economy: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/dd1701cb0_generated_image.png',
  identity: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/ba8d47f9d_generated_image.png',
  security: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/447b7b854_generated_image.png',
  notifications: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/858e916d4_generated_image.png',
  design: 'https://media.base44.com/images/public/69c5c081406b9e20deaed582/cc7fb5fb8_generated_image.png',
};

export const DOC_IMAGE_BY_SLUG = {
  overview: 'platform', stack: 'technical', social: 'social', messaging: 'social',
  forum: 'social', communities: 'social', stories: 'social', spaces: 'social',
  events: 'economy', portfolio: 'platform', blog: 'platform', profile: 'identity',
  certifications: 'identity', affiliations: 'identity', enor: 'identity',
  notifications: 'notifications', pwa: 'technical', auth: 'security', data: 'technical',
  design: 'design', integrations: 'technical', security: 'security',
  'economie-credits': 'economy', 'economie-boutique': 'economy', banque: 'economy',
  parrainage: 'economy', ads: 'economy', support: 'identity', automations: 'technical', rls: 'security',
};

export const getDocImage = (slug) => DOC_IMAGES[DOC_IMAGE_BY_SLUG[slug] || 'platform'];
export const getDocTopic = (slug) => DOC_TOPICS.find((t) => t.slug === slug) || null;

export const DOC_CATEGORIES = [
  { id: 'all', label: 'Tout', color: '#38aadc' },
  { id: 'plateforme', label: 'Plateforme', color: '#38aadc' },
  { id: 'social', label: 'Social & communauté', color: '#1dd8b4' },
  { id: 'economie', label: 'Économie & crédits', color: '#ff6d3f' },
  { id: 'identite', label: 'Identité & confiance', color: '#a78bfa' },
  { id: 'tech', label: 'Technique', color: '#f59e0b' },
];

export const DOC_TOPICS = [
  ...plateauTopics,
  ...socialTopics,
  ...economieTopics,
  ...identiteTopics,
  ...techTopics,
];

export const DOC_TOPIC_COUNT = DOC_TOPICS.length;
export const DOC_SECTION_COUNT = DOC_TOPICS.reduce((s, t) => s + (t.sections?.length || 0), 0);