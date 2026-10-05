import React from 'react';
import { insertColumnList, locales as multiColumnLocales } from '@blocknote/xl-multi-column';

/**
 * How many columns each entry inserts, keyed by the dictionary entry that
 * names it. The package ships no icons for a rebuilt schema, so draw them.
 */
export const COLUMN_MENU_ENTRIES = { two_columns: 2, three_columns: 3 };

export function ColumnsIcon({ count }) {
    const gap = 2;
    const width = (17 - gap * (count - 1)) / count;

    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            {Array.from({ length: count }, (_, index) => (
                <rect
                    key={index}
                    x={0.5 + index * (width + gap)}
                    y="2.5"
                    width={width}
                    height="13"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                />
            ))}
        </svg>
    );
}

/**
 * "Two Columns" / "Three Columns" entries for the slash menu.
 *
 * The package's own getMultiColumnSlashMenuItems() cannot be used here. It
 * hides both entries unless `editor.schema.blockSchema.columnList` is the very
 * same object the package exports, and columnListWithItemProps() replaces that
 * object to add the width and spacing props. Build the entries from the
 * package's own insertColumnList() and dictionary instead.
 */
export function columnSlashMenuItems(editor) {
    return Object.entries(COLUMN_MENU_ENTRIES).map(([entry, count]) => ({
        ...multiColumnLocales.en.slash_menu[entry],
        icon: <ColumnsIcon count={count} />,
        onItemClick: () => insertColumnList(editor, count),
    }));
}
