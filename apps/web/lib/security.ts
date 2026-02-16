
const ALLOWED_TAGS = new Set(['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li']);
const ALLOWED_ATTR = new Set(['href', 'target']);

/**
 * Strips all HTML tags from a string.
 */
export function stripHtml(text: string): string {
    if (!text) return '';
    return text.replace(/<[^>]*>?/gm, '');
}

/**
 * Sanitizes HTML by allowing only whitelisted tags and attributes.
 * Zero-dependency implementation - no jsdom required.
 */
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    // Remove script/style tags and their content entirely
    let clean = html.replace(/<(script|style|iframe|object|embed|form|input|textarea|select|button)[^>]*>[\s\S]*?<\/\1>/gi, '');
    // Remove self-closing dangerous tags
    clean = clean.replace(/<(script|style|iframe|object|embed|form|input|textarea|select|button)[^>]*\/?>/gi, '');

    // Remove event handlers (onclick, onerror, etc.)
    clean = clean.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

    // Remove javascript: and data: URLs
    clean = clean.replace(/(href|src|action)\s*=\s*(?:"(?:javascript|data|vbscript):[^"]*"|'(?:javascript|data|vbscript):[^']*')/gi, '');

    // Process remaining tags: keep allowed, strip disallowed
    clean = clean.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g, (match, tag, attrs) => {
        const tagLower = tag.toLowerCase();
        if (!ALLOWED_TAGS.has(tagLower)) return '';

        // For closing tags
        if (match.startsWith('</')) return `</${tagLower}>`;

        // Filter attributes
        const safeAttrs: string[] = [];
        if (attrs) {
            const attrRegex = /([a-zA-Z-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
            let attrMatch;
            while ((attrMatch = attrRegex.exec(attrs)) !== null) {
                const attrName = attrMatch[1].toLowerCase();
                const attrVal = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? '';
                if (ALLOWED_ATTR.has(attrName)) {
                    safeAttrs.push(`${attrName}="${attrVal}"`);
                }
            }
        }

        const attrStr = safeAttrs.length > 0 ? ' ' + safeAttrs.join(' ') : '';
        const selfClose = match.endsWith('/>') || tagLower === 'br' ? ' /' : '';
        return `<${tagLower}${attrStr}${selfClose}>`;
    });

    return clean;
}