import { describe, expect, it } from 'vitest';
import { BlockNoteEditor, createBlockSpec } from '@blocknote/core';
import { createKitSchema, kitEditorOptions, kitSlashMenuItems } from '../src/schema.jsx';

const orderButton = createBlockSpec(
    { type: 'orderButton', propSchema: { label: { default: 'Order now' } }, content: 'none' },
    { render: () => ({ dom: document.createElement('div') }) },
);

describe('createKitSchema', () => {
    it('adds the host app\'s own blocks next to the kit blocks', () => {
        const schema = createKitSchema({ blockSpecs: { orderButton: orderButton() } });

        expect(Object.keys(schema.blockSpecs)).toEqual(expect.arrayContaining(['paragraph', 'card', 'spacer', 'columnList', 'orderButton']));
        expect(schema.blockSchema.orderButton.propSchema.label.default).toBe('Order now');
    });

    it('keeps only the kit blocks when the app adds none', () => {
        expect(Object.keys(createKitSchema().blockSpecs)).not.toContain('orderButton');
    });
});

describe('kitSlashMenuItems', () => {
    const editor = BlockNoteEditor.create({ schema: createKitSchema(), ...kitEditorOptions() });
    const entry = (title, group) => ({ title, group, onItemClick: () => {} });

    it('shows the host app\'s top entries first, above BlockNote\'s own', () => {
        const titles = kitSlashMenuItems(editor, [], [entry('New card', 'This section')]).map((item) => item.title);

        expect(titles[0]).toBe('New card');
        expect(titles).toContain('Heading 1');
    });

    it('keeps the host app\'s other entries after the kit\'s', () => {
        const items = kitSlashMenuItems(editor, [entry('Order button', 'Sales')]);

        expect(items.at(-1).title).toBe('Order button');
        expect(items[0].title).not.toBe('Order button');
    });
});
