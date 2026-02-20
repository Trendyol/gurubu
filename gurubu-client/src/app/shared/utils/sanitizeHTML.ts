import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (html: string, options?: DOMPurify.Config): string => {
  if (typeof window === 'undefined') {
    // Server-side rendering: return empty string or basic sanitization
    return '';
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'span', 'div', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'class', 'style', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...options,
  });
};

/**
 * Sanitizes HTML for dangerouslySetInnerHTML usage
 * Use this wrapper for React dangerouslySetInnerHTML prop
 */
export const sanitizeForInnerHTML = (html: string): { __html: string } => {
  return { __html: sanitizeHTML(html) };
};
