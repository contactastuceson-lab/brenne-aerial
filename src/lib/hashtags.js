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
export function extractMentions(text = '') {
  const matches = text.match(/@([\w.-]+)/g) || [];
  return [...new Set(matches.map(t => t.slice(1).toLowerCase()))];
}