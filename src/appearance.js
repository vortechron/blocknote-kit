import { videoEmbedUrl } from './video-embed.js';

/**
 * The look of a section around the editor: a flat colour, a picture or a
 * looping video behind it, a tint, blur and position for the picture, a white
 * card for the text, padding, how wide the text column grows and whether the
 * section fills the screen.
 *
 * appearanceToSurface() turns that into the class names, inline style and
 * background video the editor surface wears, so the editor looks like the
 * finished section on the page.
 *
 * This mirrors the page renderer in vortechron/filament-block-editor
 * (HasBlockAppearance and BlockAppearanceFields::editorAttributes()). Keep the
 * two in step, or the editor and the public page disagree.
 */

/** Padding presets, the same names and sizes the page renderer uses. */
export const SPACING = { none: '0', sm: '1rem', md: '2rem', lg: '3.5rem', xl: '6rem' };

/** The widest the text column may grow. `full` is edge to edge. */
export const CONTENT_WIDTHS = { narrow: '42rem', normal: '53rem', wide: '72rem', full: 'none' };

/** CSS background-position / object-position for each position name. */
export const POSITIONS = {
    center: 'center',
    top: 'top',
    bottom: 'bottom',
    left: 'left',
    right: 'right',
    'top-left': 'top left',
    'top-right': 'top right',
    'bottom-left': 'bottom left',
    'bottom-right': 'bottom right',
};

export const DEFAULT_TINT_COLOR = '#0f172a';

export const MAX_BLUR = 20;

/**
 * Defaults for a brand new section. Every key is optional in an appearance.
 */
export const DEFAULT_APPEARANCE = Object.freeze({
    backgroundType: null,
    backgroundColor: null,
    backgroundImageUrl: null,
    backgroundVideoUrl: null,
    tintColor: DEFAULT_TINT_COLOR,
    tintStyle: 'normal',
    tintOpacity: 45,
    position: 'center',
    blur: 0,
    card: false,
    padding: 'md',
    contentWidth: 'normal',
    fullHeight: false,
});

/**
 * A lowercase "#rrggbb", or the fallback when the value is not a six-digit
 * hex colour. Every colour goes through here before it reaches a style, so a
 * bad value never becomes raw CSS.
 */
export function hexColor(value, fallback = null) {
    const match = /^#?([0-9a-f]{6})$/i.exec(typeof value === 'string' ? value.trim() : '');

    return match ? `#${match[1].toLowerCase()}` : fallback;
}

/**
 * True when text on this colour should be white (YIQ brightness).
 */
export function isDarkColor(value) {
    const hex = hexColor(value);

    if (hex === null) {
        return false;
    }

    const red = parseInt(hex.slice(1, 3), 16);
    const green = parseInt(hex.slice(3, 5), 16);
    const blue = parseInt(hex.slice(5, 7), 16);

    return (red * 299 + green * 587 + blue * 114) / 1000 < 128;
}

function clamp(value, min, max) {
    const number = Number.parseInt(value, 10);

    return Math.min(Math.max(Number.isNaN(number) ? min : number, min), max);
}

/**
 * The saved type when there is one, else the best guess from the media the
 * section carries.
 */
export function resolveBackgroundType(appearance) {
    if (['color', 'image', 'video'].includes(appearance.backgroundType)) {
        return appearance.backgroundType;
    }

    if (appearance.backgroundVideoUrl) {
        return 'video';
    }

    return appearance.backgroundImageUrl ? 'image' : 'color';
}

/**
 * A YouTube, Vimeo or Loom link tuned to play silently on repeat behind a
 * section, or null when the link is a plain video file (or empty).
 */
export function backgroundVideoEmbedUrl(url) {
    const embed = videoEmbedUrl(url);

    if (embed === null) {
        return null;
    }

    const youTube = /youtube-nocookie\.com\/embed\/([\w-]+)/.exec(embed);

    if (youTube) {
        return withQuery(embed, {
            autoplay: 1,
            mute: 1,
            loop: 1,
            playlist: youTube[1],
            controls: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            disablekb: 1,
            iv_load_policy: 3,
        });
    }

    if (embed.includes('player.vimeo.com/')) {
        return withQuery(embed, { background: 1, autoplay: 1, muted: 1, loop: 1 });
    }

    return withQuery(embed, { autoplay: 1, muted: 1 });
}

/** Append parameters to a URL that may already carry a query string. */
function withQuery(url, parameters) {
    const query = new URLSearchParams(Object.entries(parameters).map(([key, value]) => [key, String(value)]));

    return url + (url.includes('?') ? '&' : '?') + query.toString();
}

/**
 * Class names, inline style and background video for the editor surface.
 *
 * @param {Partial<typeof DEFAULT_APPEARANCE>} input
 * @returns {{ className: string, style: Record<string, string>, video: { embed: boolean, url: string } | null }}
 */
export function appearanceToSurface(input = {}) {
    const appearance = { ...DEFAULT_APPEARANCE, ...withoutUndefined(input) };
    const padding = SPACING[appearance.padding] ?? SPACING.md;
    const width = CONTENT_WIDTHS[appearance.contentWidth] ?? CONTENT_WIDTHS.normal;

    // --bnk-block-pad lets a stretched item cancel this padding, the same way
    // it does on the public page.
    const style = {
        padding,
        '--bnk-block-pad': padding,
        '--bnk-block-width': width === 'none' ? '100%' : width,
    };

    if (appearance.fullHeight) {
        style.minHeight = '70vh';
    }

    const type = resolveBackgroundType(appearance);

    if (type === 'color') {
        const color = hexColor(appearance.backgroundColor);

        if (color === null) {
            return { className: '', style, video: null };
        }

        return {
            className: ['bnk-blocknote-has-bg', isDarkColor(color) ? 'bnk-blocknote-light-text' : null].filter(Boolean).join(' '),
            style: { ...style, backgroundColor: color },
            video: null,
        };
    }

    const mediaUrl = type === 'image' ? appearance.backgroundImageUrl : appearance.backgroundVideoUrl;

    if (! mediaUrl) {
        return { className: '', style, video: null };
    }

    const classes = [
        'bnk-blocknote-has-bg',
        'bnk-blocknote-has-media',
        appearance.card ? 'bnk-blocknote-card' : 'bnk-blocknote-light-text',
    ];

    style['--bnk-bg-tint'] = hexColor(appearance.tintColor, DEFAULT_TINT_COLOR);
    style['--bnk-bg-tint-opacity'] = String(clamp(appearance.tintOpacity ?? 45, 0, 100) / 100);
    style['--bnk-bg-tint-blend'] = appearance.tintStyle === 'blend' ? 'multiply' : 'normal';
    style['--bnk-bg-position'] = POSITIONS[appearance.position] ?? 'center';
    style['--bnk-bg-blur'] = `${clamp(appearance.blur ?? 0, 0, MAX_BLUR)}px`;

    if (type === 'image') {
        style['--bnk-bg-image'] = `url(${JSON.stringify(String(mediaUrl))})`;

        return { className: classes.join(' '), style, video: null };
    }

    // A dark surface stands in for the video while it loads.
    style.backgroundColor = '#1e293b';
    const embed = backgroundVideoEmbedUrl(mediaUrl);

    return {
        className: classes.join(' '),
        style,
        video: { embed: embed !== null, url: embed ?? mediaUrl },
    };
}

function withoutUndefined(object) {
    return Object.fromEntries(Object.entries(object ?? {}).filter(([, value]) => value !== undefined));
}
