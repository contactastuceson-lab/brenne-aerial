export function parseEntityDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;

  const dateString = String(value);
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(dateString);
  const parsed = new Date(hasTimezone ? dateString : `${dateString}Z`);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}