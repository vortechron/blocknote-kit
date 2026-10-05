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
 * @param {{ fonts?: Array<{ value: string, label: string, stack: string }> }} options
 */
export function createKitSchema({ fonts = [] } = {}) {
    // withMultiColumn adds its own columnList spec, so the extended one has to
    // replace it afterwards.
    return withMultiColumn(BlockNoteSchema.create({
        blockSpecs: withItemProps(withVideoEmbeds({
            ...defaultBlockSpecs,
            spacer: spacerSpec(),
            card: cardSpec(),
        })),
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
 * Every "/" menu entry: BlockNote's own, two and three columns, the spacer
 * and the card.
 */
export function kitSlashMenuItems(editor) {
    return combineByGroup(
        getDefaultReactSlashMenuItems(editor),
        columnSlashMenuItems(editor),
        [spacerSlashMenuItem(editor), cardSlashMenuItem(editor)],
    );
}
