import { describe, expect, it } from 'vitest';
import { normalizeDocument } from '../src/normalize.js';

describe('normalizeDocument', () => {
    it('turns empty props and styles arrays back into objects', () => {
        expect(normalizeDocument([
            { type: 'paragraph', props: [], content: [{ type: 'text', text: 'Hi', styles: [] }] },
        ])).toEqual([
            { type: 'paragraph', props: {}, content: [{ type: 'text', text: 'Hi', styles: {} }] },
        ]);
    });

    it('keeps an empty content list a list', () => {
        expect(normalizeDocument([{ type: 'paragraph', props: {}, content: [] }])[0].content).toEqual([]);
    });

    it('adds the table content type BlockNote needs, also inside columns', () => {
        const table = { type: 'table', content: { rows: [{ cells: [[]] }] } };
        const document = normalizeDocument([
            { type: 'columnList', props: {}, children: [{ type: 'column', props: { width: 1 }, children: [table] }] },
        ]);

        expect(document[0].children[0].children[0].content).toEqual({ type: 'tableContent', rows: [{ cells: [[]] }] });
    });

    it('reads JSON text and treats an empty document as no content', () => {
        expect(normalizeDocument('[{"type":"paragraph","props":[]}]')).toEqual([{ type: 'paragraph', props: {} }]);
        expect(normalizeDocument([])).toBeUndefined();
        expect(normalizeDocument('not json')).toBeUndefined();
        expect(normalizeDocument(null)).toBeUndefined();
    });
});
