import { describe, expect, it } from 'vitest';
import { videoEmbedUrl } from '../src/video-embed.js';

describe('videoEmbedUrl', () => {
    it.each([
        ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'],
        ['https://youtu.be/dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'],
        ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'],
        ['https://vimeo.com/76979871', 'https://player.vimeo.com/video/76979871'],
        ['https://vimeo.com/76979871/abc123def', 'https://player.vimeo.com/video/76979871?h=abc123def'],
        ['https://vimeo.com/channels/staffpicks/76979871', 'https://player.vimeo.com/video/76979871'],
        ['https://player.vimeo.com/video/76979871?h=abc123def', 'https://player.vimeo.com/video/76979871?h=abc123def'],
        ['https://vimeo.com/event/12345', 'https://vimeo.com/event/12345/embed'],
        ['https://www.loom.com/share/abc123', 'https://www.loom.com/embed/abc123'],
    ])('turns %s into its player URL', (url, expected) => {
        expect(videoEmbedUrl(url)).toBe(expected);
    });

    it.each([['https://example.com/clip.mp4'], [''], [null], [undefined]])('leaves %s as a plain video', (url) => {
        expect(videoEmbedUrl(url)).toBeNull();
    });
});
