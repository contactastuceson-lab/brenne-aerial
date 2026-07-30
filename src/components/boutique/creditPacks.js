import { base44 } from '@/api/base44Client';

export const CREDIT_PACKS = [
  { id: 'pack_50',   credits: 50,   price: '2,99 €' },
  { id: 'pack_120',  credits: 120,  price: '5,99 €',  popular: true },
  { id: 'pack_250',  credits: 250,  price: '9,99 €' },
  { id: 'pack_500',  credits: 500,  price: '17,99 €' },
  { id: 'pack_1000', credits: 1000, price: '29,99 €' },
  { id: 'pack_2000', credits: 2000, price: '49,99 €' },
];

export async function startCreditPurchase(packId) {
  const res = await base44.functions.invoke('createCreditPurchase', { packId });
  const data = res?.data || res;
  if (data?.url) {
    window.location.href = data.url;
    return true;
  }
  throw new Error(data?.error || 'Erreur lors de la création du paiement');
}