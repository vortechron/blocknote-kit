// "Insert at the caret" for merge tags and snippets: a button outside the
// editor (a Variables panel, a list of placeholders) drops text where the user
// was last typing, in a BlockNote editor or a plain text field. When nothing
// was focused, the text is copied to the clipboard instead.
//
// Caret positions are remembered here because a re-render by the host app can
// reset a blurred input's own selection back to the start.
//
// Call trackTextTargets() once, then insertText('{{ name }}').
const TEXT_FIELD_SELECTOR = 'input:not([type]), input[type="text"], textarea';

const editors = new WeakMap();

const noTarget = { kind: null, editor: null, field: null, start: null, end: null };

let target = noTarget;

/**
 * Tell the tracker which editor lives in which element. BlockEditor does this
 * for you when trackTextTargets() is on.
 */
export function registerEditor(mountElement, editor) {
    editors.set(mountElement, editor);
}

function rememberCaret(field) {
    target = { ...target, start: field.selectionStart, end: field.selectionEnd };
}

function trackFocus(event) {
    const element = event.target;

    // Focus moving into a dialog (the one holding the panel, say) keeps the
    // last real target.
    if (!(element instanceof HTMLElement) || element.closest('dialog, [role="dialog"], .fi-modal')) {
        return;
    }

    const mountElement = element.closest('[data-bnk-editor]');

    if (mountElement && editors.has(mountElement)) {
        target = { ...noTarget, kind: 'editor', editor: editors.get(mountElement) };

        return;
    }

    if (element.matches(TEXT_FIELD_SELECTOR)) {
        target = { ...noTarget, kind: 'field', field: element };
        rememberCaret(element);
    }
}

function trackCaret(event) {
    if (target.kind === 'field' && event.target === target.field) {
        rememberCaret(target.field);
    }
}

function trackSelection() {
    if (target.kind === 'field' && document.activeElement === target.field) {
        rememberCaret(target.field);
    }
}

function insertIntoField(field, token) {
    const start = target.start ?? field.value.length;
    const end = target.end ?? start;

    field.setRangeText(token, start, end, 'end');
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));

    target = { ...target, start: start + token.length, end: start + token.length };
}

/**
 * Drop text at the remembered caret. Returns 'inserted', or 'copied' when no
 * editor or field was focused (the text went to the clipboard).
 */
export function insertText(token) {
    if (target.kind === 'editor' && target.editor) {
        target.editor.insertInlineContent(token);

        return 'inserted';
    }

    if (target.kind === 'field' && target.field?.isConnected) {
        insertIntoField(target.field, token);

        return 'inserted';
    }

    navigator.clipboard?.writeText(token).catch(() => {});

    return 'copied';
}

let tracking = false;

/**
 * Start remembering where the user types. Safe to call more than once.
 */
export function trackTextTargets() {
    if (tracking || typeof document === 'undefined') {
        return;
    }

    tracking = true;

    document.addEventListener('focusin', trackFocus);
    document.addEventListener('keyup', trackCaret);
    document.addEventListener('mouseup', trackCaret);
    document.addEventListener('input', trackCaret);
    document.addEventListener('selectionchange', trackSelection);
}
