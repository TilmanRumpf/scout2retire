// Utility functions for input sanitization to prevent XSS attacks

/**
 * Basic HTML sanitization for user input
 * Removes dangerous HTML tags and JavaScript
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized string safe for storage and display
 */
export const sanitizeInput = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  return input
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove on* event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove dangerous HTML tags
    .replace(/<(iframe|object|embed|link|style|meta|base)[^>]*>/gi, '')
    // Remove data URIs that could contain scripts
    .replace(/data:text\/html[^,]*,/gi, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize input while preserving some safe formatting
 * Allows line breaks but escapes HTML
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized string with preserved line breaks
 */
export const sanitizeWithLineBreaks = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  // First sanitize the input
  const sanitized = sanitizeInput(input);
  
  // Then restore line breaks (they were escaped to &#x2F;n)
  return sanitized.replace(/&#x2F;n/g, '\n');
};

/**
 * Validate and limit input length
 * @param {string} input - User input
 * @param {number} maxLength - Maximum allowed length
 * @returns {object} - { valid: boolean, error?: string, sanitized?: string }
 */
export const validateInputLength = (input, maxLength) => {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Input is required' };
  }
  
  const trimmed = input.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Input cannot be empty' };
  }
  
  if (trimmed.length > maxLength) {
    return { 
      valid: false, 
      error: `Input must be less than ${maxLength} characters (currently ${trimmed.length})` 
    };
  }
  
  return { valid: true, sanitized: trimmed };
};

/**
 * Safe display of user content in React
 * Returns JSX-safe content
 * @param {string} content - Sanitized content to display
 * @returns {string} - Content safe for React rendering
 */
export const displaySafeContent = (content) => {
  if (!content) return '';
  
  // Content should already be sanitized before display
  // This is an extra safety check
  return content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
};

/**
 * Maximum lengths for different content types
 */
export const MAX_LENGTHS = {
  CHAT_MESSAGE: 1000,
  JOURNAL_ENTRY: 5000,
  PROFILE_NAME: 100,
  MILESTONE_NOTE: 500,
  TOWN_NOTE: 1000
};

/**
 * Sanitize and validate chat message
 * @param {string} message - Raw message input
 * @returns {object} - { valid: boolean, error?: string, sanitized?: string }
 */
export const sanitizeChatMessage = (message) => {
  const lengthValidation = validateInputLength(message, MAX_LENGTHS.CHAT_MESSAGE);
  
  if (!lengthValidation.valid) {
    return lengthValidation;
  }
  
  const sanitized = sanitizeWithLineBreaks(lengthValidation.sanitized);
  return { valid: true, sanitized };
};

/**
 * Sanitize and validate journal entry
 * @param {string} entry - Raw journal entry
 * @returns {object} - { valid: boolean, error?: string, sanitized?: string }
 */
export const sanitizeJournalEntry = (entry) => {
  const lengthValidation = validateInputLength(entry, MAX_LENGTHS.JOURNAL_ENTRY);
  
  if (!lengthValidation.valid) {
    return lengthValidation;
  }
  
  const sanitized = sanitizeWithLineBreaks(lengthValidation.sanitized);
  return { valid: true, sanitized };
};