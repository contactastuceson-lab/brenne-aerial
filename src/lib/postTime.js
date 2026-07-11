export function formatPostTime(dateValue) {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (elapsedSeconds < 60) return 'maintenant';
  if (elapsedSeconds < 3600) return `${Math.floor(elapsedSeconds / 60)}m`;
  if (elapsedSeconds < 86400) return `${Math.floor(elapsedSeconds / 3600)}h`;
  if (elapsedSeconds < 604800) return `${Math.floor(elapsedSeconds / 86400)}j`;
  if (elapsedSeconds < 31536000) return `${Math.floor(elapsedSeconds / 604800)}sem`;
  return `${Math.floor(elapsedSeconds / 31536000)}a`;
}