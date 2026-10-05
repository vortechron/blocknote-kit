import { describe, expect, it } from 'vitest';
import { createBlockSpec } from '@blocknote/core';
import { createKitSchema } from '../src/schema.jsx';

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
