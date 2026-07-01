/**
 * Extract hashtags from text content
 * @param {string} text
 * @returns {string[]} array of hashtags (without #)
 */
export function extractHashtags(text = '') {
  const matches = text.match(/#([\wÀ-ÿ]+)/g) || [];
  return [...new Set(matches.map(t => t.slice(1).toLowerCase()))];
}

/**
 * Extract mentions from text content
 * @param {string} text
 * @returns {string[]} array of usernames (without @)
 */
/**
 * Split text into parts, isolating hashtags for inline rendering
 * @param {string} text
 * @returns {string[]} array of parts, hashtags start with '#'
 */
export function parseHashtags(text = '') {
  return text.split(/(#[\wÀ-ÿ]+)/g).filter(Boolean);
}

export function extractMentions(text = '') {
  const matches = text.match(/@([\w.-]+)/g) || [];
  return [...new Set(matches.map(t => t.slice(1).toLowerCase()))];
}