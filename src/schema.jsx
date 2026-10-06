import {
    BlockNoteSchema,
    combineByGroup,
    defaultBlockSpecs,
    defaultStyleSpecs,
} from '@blocknote/core';
import { en as coreEn } from '@blocknote/core/locales';
import { getDefaultReactSlashMenuItems } from '@blocknote/react';
import {
    locales as multiColumnLocales,
    multiColumnDropCursor,
    withMultiColumn,
} from '@blocknote/xl-multi-column';
import { cardSlashMenuItem, cardSpec } from './blocks/card.jsx';
import { spacerSlashMenuItem, spacerSpec } from './blocks/spacer.jsx';
import { columnSlashMenuItems } from './columns.jsx';
import { fontFamilyStyleSpec } from './font-family.jsx';
import { columnListWithItemProps, withItemProps } from './item-width.jsx';
import { withVideoEmbeds } from './video-embed.js';

/**
 * The BlockNote schema with every kit block: the default blocks (with a
 * per-item width and spacing, and videos that embed YouTube, Vimeo and Loom),
 * a spacer, a fold-out card, two and three column layouts that can be resized,
 * and a font family style.
 *
 * `blockSpecs` adds the host app's own blocks, such as an order button. They
 * are used as given: to offer "Space above" and "Space below" on one, put
 * SPACING_PROP_SCHEMA in its propSchema.
 *
 * @param {{ fonts?: Array<{ value: string, label: string, stack: string }>, blockSpecs?: Record<string, object> }} options
 */
export function createKitSchema({ fonts = [], blockSpecs = {} } = {}) {
    // withMultiColumn adds its own columnList spec, so the extended one has to
    // replace it afterwards.
    return withMultiColumn(BlockNoteSchema.create({
        blockSpecs: {
            ...withItemProps(withVideoEmbeds({
                ...defaultBlockSpecs,
                spacer: spacerSpec(),
                card: cardSpec(),
            })),
            ...blockSpecs,
        },
        styleSpecs: {
            ...defaultStyleSpecs,
            fontFamily: fontFamilyStyleSpec(fonts),
        },
    })).extend({
        blockSpecs: {
            columnList: columnListWithItemProps(),
        },
    });
}

/**
 * Editor options the kit schema needs besides the schema itself: the drop
 * cursor that lets blocks be dropped into columns, and the column labels.
 */
export function kitEditorOptions() {
    return {
        dropCursor: multiColumnDropCursor,
        dictionary: {
            ...coreEn,
            multi_column: multiColumnLocales.en,
        },
    };
}

/**
 * Every "/" menu entry: the host app's top entries first, then BlockNote's
 * own, two and three columns, the spacer, the card, and any entries the host
 * app adds for its own blocks.
 *
 * @param {object} editor
 * @param {Array<object>} [extraItems] the host app's entries, after the kit's
 * @param {Array<object>} [topItems] the host app's entries shown first, above
 *     BlockNote's own groups, for what its users add most
 */
export function kitSlashMenuItems(editor, extraItems = [], topItems = []) {
    return [
        ...topItems,
        ...combineByGroup(
            getDefaultReactSlashMenuItems(editor),
            columnSlashMenuItems(editor),
            [spacerSlashMenuItem(editor), cardSlashMenuItem(editor)],
            extraItems,
        ),
    ];
}
