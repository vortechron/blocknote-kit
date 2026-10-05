import React from 'react';
import { createRoot } from 'react-dom/client';
import { BlockEditor } from './BlockEditor.jsx';

/**
 * Mount the kit editor into a plain DOM element, for pages that are not built
 * with React (Blade, Alpine, Livewire, Vue, plain HTML).
 *
 *   const handle = mountBlockEditor(element, { initialContent, onChange });
 *   handle.update({ appearance });   // re-render with new props
 *   handle.unmount();
 *
 * Mounting twice on the same element returns the first handle, so a host that
 * re-runs its start-up code does not get a second editor.
 *
 * @param {HTMLElement} element
 * @param {object} props the same props as <BlockEditor>
 */
export function mountBlockEditor(element, props = {}) {
    if (element.__bnkHandle) {
        return element.__bnkHandle;
    }

    const root = createRoot(element);
    let current = props;

    const render = () => root.render(<BlockEditor {...current} />);

    const handle = {
        update(next) {
            current = { ...current, ...next };
            render();
        },
        unmount() {
            root.unmount();
            delete element.__bnkHandle;
        },
    };

    element.__bnkHandle = handle;
    render();

    return handle;
}
