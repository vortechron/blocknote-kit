import React from 'react';
import { insertOrUpdateBlockForSlashMenu } from '@blocknote/core';
import { createReactBlockSpec } from '@blocknote/react';

/**
 * "Spacer" block: adjustable empty vertical space.
 *
 * Keep the size map in sync with the page renderer
 * (BlockNoteRenderer::spacerHeight() in vortechron/filament-block-editor).
 */
export const SPACER_SIZES = { sm: '1rem', md: '2.5rem', lg: '5rem', xl: '8rem' };

export const spacerSpec = createReactBlockSpec(
    {
        type: 'spacer',
        propSchema: {
            size: { default: 'md', values: Object.keys(SPACER_SIZES) },
        },
        content: 'none',
    },
    {
        render: ({ block, editor }) => (
            <div
                className="bnk-spacer"
                style={{ height: SPACER_SIZES[block.props.size] ?? SPACER_SIZES.md }}
            >
                <div className="bnk-spacer-controls" contentEditable={false}>
                    {Object.keys(SPACER_SIZES).map((size) => (
                        <button
                            key={size}
                            type="button"
                            className={size === block.props.size ? 'is-active' : ''}
                            onClick={() => editor.updateBlock(block, { props: { size } })}
                        >
                            {size.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        ),
    },
);

export function spacerSlashMenuItem(editor) {
    return {
        title: 'Spacer',
        subtext: 'Adjustable empty vertical space',
        aliases: ['spacer', 'space', 'gap', 'padding', 'margin'],
        group: 'Basic blocks',
        icon: <span style={{ fontSize: '14px' }}>↕</span>,
        onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: 'spacer' }),
    };
}
