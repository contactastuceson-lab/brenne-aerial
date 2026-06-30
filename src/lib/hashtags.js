/**
 * Hashtag utilities — parses, renders, and routes hashtags.
 */

/** Extract all unique hashtags from a string */
export function extractHashtags(text = '') {
  const matches = text.match(/#([a-zA-ZÀ-ÿ0-9_]+)/g) || [];
  return [...new Set(matches.map(t => t.slice(1).toLowerCase()))];
}

/** Replace #hashtag occurrences in text with a marker for rendering */
export function parseHashtags(text = '') {
  // Split text into parts: regular text and hashtags
  return text.split(/(#[a-zA-ZÀ-ÿ0-9_]+)/g);
}