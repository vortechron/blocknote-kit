import type { ReactElement } from 'react';

/** A stored BlockNote document: a list of blocks. */
export type BlockDocument = Array<Record<string, unknown>>;

export interface FontOption {
    /** The key stored in the document, for example "georgia". */
    value: string;
    /** The name the picker shows. */
    label: string;
    /** The CSS font-family stack the editor draws it with. */
    stack: string;
}

export interface MediaAsset {
    id: string | number;
    name: string;
    url: string;
    is_video: boolean;
}

export interface MediaLibrary {
    list(query: {
        search: string;
        page: number;
        kind: 'image' | 'video' | '';
        signal?: AbortSignal;
    }): Promise<{ data: MediaAsset[]; last_page: number }>;
    upload(file: File): Promise<unknown>;
}

export type Spacing = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type ContentWidth = 'narrow' | 'normal' | 'wide' | 'full';

export type BackgroundPosition =
    | 'center' | 'top' | 'bottom' | 'left' | 'right'
    | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** The look of the section around the editor. Every key is optional. */
export interface Appearance {
    backgroundType?: 'color' | 'image' | 'video' | null;
    /** "#rrggbb" */
    backgroundColor?: string | null;
    backgroundImageUrl?: string | null;
    /** A YouTube, Vimeo or Loom link, or a direct .mp4 / .webm file. */
    backgroundVideoUrl?: string | null;
    /** "#rrggbb", laid over a picture or video. */
    tintColor?: string | null;
    tintStyle?: 'normal' | 'blend';
    /** 0 to 100 */
    tintOpacity?: number;
    position?: BackgroundPosition;
    /** 0 to 20 pixels */
    blur?: number;
    /** Put the text on a white card over the picture. */
    card?: boolean;
    padding?: Spacing;
    contentWidth?: ContentWidth;
    fullHeight?: boolean;
}

export interface Surface {
    className: string;
    style: Record<string, string>;
    video: { embed: boolean; url: string } | null;
}

export interface BlockEditorProps {
    /** The stored document, as an array or JSON text. Read once, on mount. */
    initialContent?: BlockDocument | string | null;
    /** Called with the whole document after every change. */
    onChange?: (document: BlockDocument) => void;
    editable?: boolean;
    /** Font picker choices. Leave empty to hide the picker. */
    fonts?: FontOption[];
    /** Store a dropped or pasted file and resolve to its URL. */
    uploadFile?: (file: File) => Promise<string>;
    /** Turns on the media library sheet for images, videos and card banners. */
    media?: MediaLibrary;
    /** The section look painted around the editor. */
    appearance?: Appearance;
    /** Draw the section surface. Set false when the host page draws it. */
    surface?: boolean;
    /** Let insertText() drop text into this editor. */
    trackInsertTargets?: boolean;
    onEditorReady?: (editor: any) => void;
    /** Extra classes for the surface. */
    className?: string;
}

export function BlockEditor(props: BlockEditorProps): ReactElement;

export interface BlockEditorHandle {
    update(props: Partial<BlockEditorProps>): void;
    unmount(): void;
}

export function mountBlockEditor(element: HTMLElement, props?: BlockEditorProps): BlockEditorHandle;

export function createKitSchema(options?: { fonts?: FontOption[] }): any;
export function kitEditorOptions(): { dropCursor: unknown; dictionary: Record<string, unknown> };
export function kitSlashMenuItems(editor: any): any[];
export function normalizeDocument(document: unknown): BlockDocument | undefined;

export function appearanceToSurface(appearance?: Appearance): Surface;
export function backgroundVideoEmbedUrl(url: string | null | undefined): string | null;
export function hexColor(value: unknown, fallback?: string | null): string | null;
export function isDarkColor(value: unknown): boolean;
export function resolveBackgroundType(appearance: Appearance): 'color' | 'image' | 'video';
export const SPACING: Record<Spacing, string>;
export const CONTENT_WIDTHS: Record<ContentWidth, string>;
export const POSITIONS: Record<BackgroundPosition, string>;
export const DEFAULT_APPEARANCE: Readonly<Required<Appearance>>;
export const DEFAULT_TINT_COLOR: string;
export const MAX_BLUR: number;

export function videoEmbedUrl(url: string | null | undefined): string | null;
export function withVideoEmbeds<T>(blockSpecs: T): T;

export const cardSpec: () => any;
export function cardSlashMenuItem(editor: any): any;
export const CARD_BUTTON_COLOR: string;
export const spacerSpec: () => any;
export function spacerSlashMenuItem(editor: any): any;
export const SPACER_SIZES: Record<'sm' | 'md' | 'lg' | 'xl', string>;
export function columnSlashMenuItems(editor: any): any[];
export function ColumnsIcon(props: { count: number }): ReactElement;

export const FONT_FAMILY_STYLE: 'fontFamily';
export function fontFamilyStyleSpec(fonts: FontOption[]): any;
export function FontFamilySelect(props: { fonts: FontOption[] }): ReactElement | null;

export const WIDTH_COLUMNS: number;
export const BLEED_STEPS: number;
export function withItemProps<T>(blockSpecs: T): T;
export function columnListWithItemProps(): any;
export function BlockItemControls(props: { editor: any; editable: boolean }): ReactElement | null;

export const ITEM_SPACING: Record<Spacing, string>;
export const SPACING_PROP_SCHEMA: Record<string, unknown>;
export function SpacingDragHandleMenu(): ReactElement;

export function MediaFilePanelController(): ReactElement | null;
export function MediaFormattingToolbar(props: Record<string, unknown> & { fonts?: FontOption[]; useLibrary?: boolean }): ReactElement;
export function MediaLibraryDialog(props: { editor: any; media: MediaLibrary }): ReactElement;

export function trackTextTargets(): void;
export function registerEditor(element: Element, editor: any): void;
export function insertText(text: string): 'inserted' | 'copied';
