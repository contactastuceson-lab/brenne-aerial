import { useId } from 'react';

const ROSETTE_PATH = 'M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.275C14.77 2.515 13.435 1.5 11.89 1.5c-1.545 0-2.88 1.015-3.513 2.285-.417-.175-.878-.275-1.358-.275-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.275.633 1.27 1.968 2.285 3.513 2.285 1.545 0 2.88-1.015 3.513-2.285.417.175.878.275 1.358.275 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.425l-3.64-3.51 1.4-1.35 2.14 2.065 5.22-5.03 1.4 1.35-6.52 6.285z';
const CUT_PATH = 'M11.16 1.15a1.247 1.247 0 0 1 1.68 0l2.58 2.33c.27.24.62.37.98.37h3.39c.69 0 1.25.56 1.25 1.25v3.39c0 .36.13.71.37.98l2.33 2.58c.44.49.44 1.21 0 1.7l-2.33 2.58c-.24.27-.37.62-.37.98v3.39c0 .69-.56 1.25-1.25 1.25h-3.39c-.36 0-.71.13-.98.37l-2.58 2.33a1.247 1.247 0 0 1-1.68 0l-2.58-2.33c-.27-.24-.62-.37-.98-.37H5.16c-.69 0-1.25-.56-1.25-1.25v-3.39c0-.36-.13-.71-.37-.98L1.21 13.7a1.247 1.247 0 0 1 0-1.7l2.33-2.58c.24-.27.37-.62.37-.98V5.15c0-.69.56-1.25 1.25-1.25h3.39c.36 0 .71-.13.98-.37l2.58-2.33zm-.38 14.425l-3.64-3.51 1.4-1.35 2.14 2.065 5.22-5.03 1.4 1.35-6.52 6.285z';
const COLORS = { verified: 'rgb(29, 155, 240)', pro: 'rgb(34, 197, 94)', official: 'rgb(168, 85, 247)', certified: 'rgb(250, 204, 21)', government: 'rgb(134, 142, 150)' };

export default function VerificationMark({ type = 'verified', className = '' }) {
  const uniqueId = useId().replace(/:/g, '');
  const goldGradientId = `goldGrad-${uniqueId}`;
  const goldMaskId = `checkMaskGold-${uniqueId}`;
  const crystalBgId = `crystalBg-${uniqueId}`;
  const chromeCheckId = `chromeCheck-${uniqueId}`;
  const maskId = `checkMask-${uniqueId}`;
  const isRosette = ['verified', 'pro', 'official'].includes(type);
  const isCertified = type === 'certified';
  const isSupreme = type === 'supreme';
  const fill = COLORS[type] || COLORS.verified;

  return <svg viewBox="0 0 24 24" aria-label={type} className={className} style={{ width: '1.1em', height: '1.1em', verticalAlign: 'text-bottom', marginLeft: '2px' }}>
    <defs>
      {isCertified && <><linearGradient id={goldGradientId} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FDE047" /><stop offset="50%" stopColor="#EAB308" /><stop offset="100%" stopColor="#A16207" /></linearGradient><mask id={goldMaskId}><rect width="24" height="24" fill="white" /><path d="M10.5 16.25l-4-4 1.41-1.42L10.5 13.42l6.59-6.59L18.5 8.25z" fill="black" /></mask></>}
      {isSupreme && <><linearGradient id={crystalBgId} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(255,255,255,0.85)" /><stop offset="50%" stopColor="rgba(241,245,249,0.4)" /><stop offset="100%" stopColor="rgba(255,255,255,0.15)" /></linearGradient><linearGradient id={chromeCheckId} x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#94a3b8" /><stop offset="50%" stopColor="#f8fafc" /><stop offset="100%" stopColor="#cbd5e1" /></linearGradient></>}
      {!isRosette && !isCertified && !isSupreme && <mask id={maskId}><rect width="24" height="24" fill="white" /><path d="M10.5 16.25l-4-4 1.41-1.42L10.5 13.42l6.59-6.59L18.5 8.25z" fill="black" /></mask>}
    </defs>
    {isCertified && <path mask={`url(#${goldMaskId})`} fill={`url(#${goldGradientId})`} d={CUT_PATH} />}
    {isSupreme && <><path fill={`url(#${crystalBgId})`} d={CUT_PATH} /><path fill={`url(#${chromeCheckId})`} d="M10.5 16.25l-4-4 1.41-1.42L10.5 13.42l6.59-6.59L18.5 8.25z" /></>}
    {!isCertified && !isSupreme && <path mask={!isRosette ? `url(#${maskId})` : undefined} fill={fill} d={isRosette ? ROSETTE_PATH : CUT_PATH} />}
  </svg>;
}