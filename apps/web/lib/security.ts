import DOMPurify from 'isomorphic-dompurify';

export type SanitizationMode = 'STRICT' | 'BASIC';

const BASIC_CONFIG = {
    ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
        'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
};

const STRICT_CONFIG = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
};

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * Uses isomorphic-dompurify which works on both client and server.
 * 
 * @param html The raw HTML string to sanitize
 * @param mode 'STRICT' (no tags) or 'BASIC' (safe formatting tags)
 * @returns The sanitized HTML string
 */
export function sanitizeHtml(html: string, mode: SanitizationMode = 'BASIC'): string {
    if (!html) return '';

    const config = mode === 'STRICT' ? STRICT_CONFIG : BASIC_CONFIG;

    return DOMPurify.sanitize(html, {
        ...config,
        RETURN_TRUSTED_TYPE: false,
    }) as string;
}

/**
 * Sanitizes a plain string by removing all HTML tags.
 * 
 * @param text The text to sanitize
 * @returns Plain text without HTML
 */
export function stripHtml(text: string): string {
    return sanitizeHtml(text, 'STRICT');
}
