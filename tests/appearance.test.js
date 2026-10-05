import { describe, expect, it } from 'vitest';
import {
    appearanceToSurface,
    backgroundVideoEmbedUrl,
    hexColor,
    isDarkColor,
    resolveBackgroundType,
} from '../src/appearance.js';

describe('hexColor', () => {
    it('normalises a hex colour', () => {
        expect(hexColor('#1E1B4B')).toBe('#1e1b4b');
        expect(hexColor('1e1b4b')).toBe('#1e1b4b');
    });

    it('refuses anything that is not a six digit hex colour', () => {
        expect(hexColor('red')).toBeNull();
        expect(hexColor('#fff')).toBeNull();
        expect(hexColor('#000000; background: url(x)')).toBeNull();
        expect(hexColor(null, '#0f172a')).toBe('#0f172a');
    });
});

describe('isDarkColor', () => {
    it('says white text belongs on dark colours only', () => {
        expect(isDarkColor('#1e1b4b')).toBe(true);
        expect(isDarkColor('#000000')).toBe(true);
        expect(isDarkColor('#ffffff')).toBe(false);
        expect(isDarkColor('#f1f5f9')).toBe(false);
        expect(isDarkColor('nonsense')).toBe(false);
    });
});

describe('resolveBackgroundType', () => {
    it('prefers the saved type, then video, then image, then colour', () => {
        expect(resolveBackgroundType({ backgroundType: 'image', backgroundVideoUrl: 'x' })).toBe('image');
        expect(resolveBackgroundType({ backgroundVideoUrl: 'https://x.test/a.mp4', backgroundImageUrl: '/a.jpg' })).toBe('video');
        expect(resolveBackgroundType({ backgroundImageUrl: '/a.jpg' })).toBe('image');
        expect(resolveBackgroundType({})).toBe('color');
    });
});

describe('appearanceToSurface', () => {
    it('gives a plain section padding and a text width only', () => {
        expect(appearanceToSurface()).toEqual({
            className: '',
            style: { padding: 'clamp(1.25rem, 3.2vw, 2rem)', '--bnk-block-pad': 'clamp(1.25rem, 3.2vw, 2rem)', '--bnk-block-width': '53rem' },
            video: null,
        });
    });

    it('uses 100% for a full width section and grows a full height one', () => {
        const { style } = appearanceToSurface({ contentWidth: 'full', fullHeight: true, padding: 'xl' });

        expect(style['--bnk-block-width']).toBe('100%');
        expect(style.minHeight).toBe('70vh');
        expect(style.padding).toBe('clamp(1.5rem, 7.5vw, 6rem)');
    });

    it('paints a dark colour with white text and a light one without', () => {
        expect(appearanceToSurface({ backgroundColor: '#1e1b4b' })).toMatchObject({
            className: 'bnk-blocknote-has-bg bnk-blocknote-light-text',
            style: { backgroundColor: '#1e1b4b' },
        });
        expect(appearanceToSurface({ backgroundColor: '#f1f5f9' }).className).toBe('bnk-blocknote-has-bg');
    });

    it('ignores a colour that is not a hex code', () => {
        const surface = appearanceToSurface({ backgroundColor: 'red; color: red' });

        expect(surface.className).toBe('');
        expect(surface.style.backgroundColor).toBeUndefined();
    });

    it('draws a picture with its tint, blur and position', () => {
        const surface = appearanceToSurface({
            backgroundType: 'image',
            backgroundImageUrl: '/storage/hero.jpg',
            tintColor: '#000000',
            tintOpacity: 60,
            tintStyle: 'blend',
            blur: 99,
            position: 'top-left',
        });

        expect(surface.className).toBe('bnk-blocknote-has-bg bnk-blocknote-has-media bnk-blocknote-light-text');
        expect(surface.style).toMatchObject({
            '--bnk-bg-image': 'url("/storage/hero.jpg")',
            '--bnk-bg-tint': '#000000',
            '--bnk-bg-tint-opacity': '0.6',
            '--bnk-bg-tint-blend': 'multiply',
            '--bnk-bg-position': 'top left',
            '--bnk-bg-blur': '20px',
        });
    });

    it('puts the text on a card instead of turning it white', () => {
        const surface = appearanceToSurface({ backgroundImageUrl: '/a.jpg', card: true });

        expect(surface.className).toBe('bnk-blocknote-has-bg bnk-blocknote-has-media bnk-blocknote-card');
    });

    it('shows nothing behind a picture section that has no picture yet', () => {
        expect(appearanceToSurface({ backgroundType: 'image' }).className).toBe('');
    });

    it('plays a YouTube link silently on repeat, and a file as a video tag', () => {
        const youTube = appearanceToSurface({ backgroundVideoUrl: 'https://youtu.be/dQw4w9WgXcQ' });

        expect(youTube.video.embed).toBe(true);
        expect(youTube.video.url).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ');
        expect(youTube.style.backgroundColor).toBe('#1e293b');

        expect(appearanceToSurface({ backgroundVideoUrl: 'https://cdn.test/loop.mp4' }).video)
            .toEqual({ embed: false, url: 'https://cdn.test/loop.mp4' });
    });
});

describe('backgroundVideoEmbedUrl', () => {
    it('keeps a Vimeo privacy hash and adds its background flags after it', () => {
        expect(backgroundVideoEmbedUrl('https://vimeo.com/76979871/abc123def'))
            .toBe('https://player.vimeo.com/video/76979871?h=abc123def&background=1&autoplay=1&muted=1&loop=1');
    });
});

describe('surface padding', () => {
    it('shrinks on a small screen and stops at the full size, like the public page', () => {
        expect(appearanceToSurface({ padding: 'xl' }).style.padding).toBe('clamp(1.5rem, 7.5vw, 6rem)');
        expect(appearanceToSurface({ padding: 'sm' }).style.padding).toBe('1rem');
        expect(appearanceToSurface({ padding: 'none' }).style.padding).toBe('0');
    });
});
