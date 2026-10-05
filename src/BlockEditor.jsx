import React, { useEffect, useMemo, useRef } from 'react';
import { filterSuggestionItems } from '@blocknote/core';
import {
    AddBlockButton,
    DragHandleButton,
    FilePanelController,
    FormattingToolbarController,
    SideMenu,
    SideMenuController,
    SuggestionMenuController,
    useCreateBlockNote,
} from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { appearanceToSurface } from './appearance.js';
import { registerEditor, trackTextTargets } from './insert-text.js';
import { BlockItemControls } from './item-width.jsx';
import { SpacingDragHandleMenu } from './item-spacing.jsx';
import { MediaFilePanelController, MediaFormattingToolbar, MediaLibraryDialog } from './media-library.jsx';
import { normalizeDocument } from './normalize.js';
import { createKitSchema, kitEditorOptions, kitSlashMenuItems } from './schema.jsx';

/**
 * The kit editor as one React component.
 *
 * BlockNote reads `initialContent` once, when the editor is created. To show
 * a different document, mount a new editor (give it a new `key`).
 *
 * @param {object} props
 * @param {Array|string} [props.initialContent] the stored document (array or JSON text)
 * @param {(document: Array) => void} [props.onChange] called with the whole document after every change
 * @param {boolean} [props.editable=true]
 * @param {Array<{value: string, label: string, stack: string}>} [props.fonts] font picker choices; empty hides it
 * @param {(file: File) => Promise<string>} [props.uploadFile] stores a dropped or pasted file and resolves to its URL
 * @param {{ list: Function, upload: Function }} [props.media] turns on the media library sheet (see MediaLibraryDialog)
 * @param {object} [props.appearance] the section look painted around the editor (see appearanceToSurface)
 * @param {boolean} [props.surface=true] draw the section surface; false when the host page draws it
 * @param {boolean} [props.trackInsertTargets=false] let insertText() drop text into this editor
 * @param {(editor) => void} [props.onEditorReady]
 * @param {string} [props.className] extra classes for the surface
 */
export function BlockEditor({
    initialContent,
    onChange,
    editable = true,
    fonts = [],
    uploadFile,
    media,
    appearance,
    surface = true,
    trackInsertTargets = false,
    onEditorReady,
    className = '',
}) {
    const hostRef = useRef(null);
    const startingContent = useMemo(() => normalizeDocument(initialContent), []); // eslint-disable-line react-hooks/exhaustive-deps

    const editor = useCreateBlockNote({
        schema: createKitSchema({ fonts }),
        ...kitEditorOptions(),
        initialContent: startingContent,
        uploadFile,
    });

    useEffect(() => {
        if (trackInsertTargets && hostRef.current) {
            trackTextTargets();
            registerEditor(hostRef.current, editor);
        }
    }, [editor, trackInsertTargets]);

    useEffect(() => {
        onEditorReady?.(editor);
    }, [editor]); // eslint-disable-line react-hooks/exhaustive-deps

    const look = surface ? appearanceToSurface(appearance) : null;
    const usesLibrary = editable && media !== undefined && media !== null;

    const view = (
        <BlockNoteView
            editor={editor}
            editable={editable}
            theme="light"
            slashMenu={false}
            sideMenu={false}
            filePanel={false}
            formattingToolbar={false}
            onChange={() => onChange?.(editor.document)}
        >
            {usesLibrary ? <MediaFilePanelController /> : <FilePanelController />}
            <FormattingToolbarController
                formattingToolbar={(props) => <MediaFormattingToolbar {...props} fonts={fonts} useLibrary={usesLibrary} />}
            />
            {/* The stock side menu, with the spacing entries added to the drag
                handle's dropdown. See item-spacing.jsx. */}
            <SideMenuController
                sideMenu={(props) => (
                    <SideMenu {...props}>
                        <AddBlockButton {...props} />
                        <DragHandleButton {...props} dragHandleMenu={SpacingDragHandleMenu} />
                    </SideMenu>
                )}
            />
            <SuggestionMenuController
                triggerCharacter="/"
                getItems={async (query) => filterSuggestionItems(kitSlashMenuItems(editor), query)}
            />
            <BlockItemControls editor={editor} editable={editable} />
        </BlockNoteView>
    );

    const dialog = usesLibrary ? <MediaLibraryDialog editor={editor} media={media} /> : null;

    if (! surface) {
        return (
            <div ref={hostRef} data-bnk-editor="">
                {dialog}
                {view}
            </div>
        );
    }

    return (
        <div
            ref={hostRef}
            data-bnk-editor=""
            className={['bnk-blocknote', look.className, className].filter(Boolean).join(' ')}
            style={look.style}
        >
            {dialog}
            {view}
            {look.video && (
                <div className="bnk-blocknote-media" aria-hidden="true">
                    {look.video.embed
                        ? <iframe src={look.video.url} title="Background video" allow="autoplay; encrypted-media" tabIndex={-1} />
                        : <video src={look.video.url} autoPlay muted loop playsInline />}
                </div>
            )}
        </div>
    );
}
