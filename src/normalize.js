/**
 * Put a stored document back into the exact shape BlockNote can open.
 *
 * - Many backends (PHP among them) turn an empty JSON object ({}) into an
 *   empty array ([]). BlockNote needs `props` and `styles` to be objects, so
 *   those are turned back.
 * - A table's `content` is read as rows only when it carries
 *   "type": "tableContent". Anything else throws "Error creating document
 *   from blocks passed as initialContent" and the whole editor stays empty.
 *
 * Returns undefined for an empty document, which is what BlockNote wants as
 * initialContent to start with one empty paragraph.
 */
const OBJECT_KEYS = new Set(['props', 'styles']);

function normalizeValue(value, key = null) {
    if (Array.isArray(value)) {
        if (value.length === 0 && OBJECT_KEYS.has(key)) {
            return {};
        }

        return value.map((item) => normalizeValue(item));
    }

    if (value && typeof value === 'object') {
        const normalized = Object.fromEntries(
            Object.entries(value).map(([childKey, childValue]) => [childKey, normalizeValue(childValue, childKey)]),
        );

        if (normalized.type === 'table' && isUntypedTableContent(normalized.content)) {
            normalized.content = { type: 'tableContent', ...normalized.content };
        }

        return normalized;
    }

    return value;
}

function isUntypedTableContent(content) {
    return content !== null
        && typeof content === 'object'
        && ! Array.isArray(content)
        && content.type === undefined
        && Array.isArray(content.rows);
}

export function normalizeDocument(document) {
    if (typeof document === 'string') {
        try {
            document = JSON.parse(document);
        } catch {
            return undefined;
        }
    }

    if (! Array.isArray(document) || document.length === 0) {
        return undefined;
    }

    return normalizeValue(document);
}
