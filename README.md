# BlockNote Kit

Extra blocks and tools for [BlockNote](https://www.blocknotejs.org), the Notion-style React editor.

This is an extension package, not a fork: BlockNote stays a normal dependency, and the kit plugs into its public extension points. You upgrade BlockNote the usual way.

- **Columns** – "Two Columns" and "Three Columns" in the `/` menu, resizable.
- **Item width** – hover any paragraph, heading, image, video or table and drag its edge. Widths snap to a 12-column grid. Past 12, an item stretches out over the section padding to the edge.
- **Item spacing** – "Space above" and "Space below" in each block's drag-handle menu.
- **Spacer** – adjustable empty space.
- **Card** – a fold-out card with a banner picture, a title and a body.
- **Video embeds** – YouTube, Vimeo and Loom links play in the editor, not as an empty player.
- **Font picker** – in the formatting toolbar, from a list you supply.
- **Media library sheet** – pick, upload or link images and videos, backed by any API you like.
- **Section look** – paint a background colour, picture or looping video, tint, blur, a text card, padding and text width around the editor, so it looks like the finished section.
- **Insert at the caret** – drop merge tags or snippets from a button outside the editor.

The [Filament plugin](https://github.com/vortechron/filament-block-editor) is built on this kit, and renders the saved documents to HTML in PHP.

## Install

```bash
npm install github:vortechron/blocknote-kit#v0.2.0 \
  @blocknote/core@0.54.0 @blocknote/react@0.54.0 @blocknote/mantine@0.54.0 @blocknote/xl-multi-column@0.54.0 \
  react react-dom
```

BlockNote, React and React DOM are peer dependencies, so your app bundles one copy of each.

## Use it in React

```jsx
import '@blocknote/mantine/style.css';
import '@vortechron/blocknote-kit/style.css';
import { BlockEditor } from '@vortechron/blocknote-kit';

export function PageEditor({ page }) {
    return (
        <BlockEditor
            initialContent={page.content}
            onChange={(document) => save(document)}
            appearance={{ backgroundColor: '#1e1b4b', padding: 'xl', contentWidth: 'wide' }}
            fonts={[{ value: 'georgia', label: 'Georgia', stack: 'Georgia, serif' }]}
            uploadFile={async (file) => (await upload(file)).url}
            media={{
                list: ({ search, page, kind }) => api.get('/media', { search, page, kind }),
                upload: (file) => upload(file),
            }}
        />
    );
}
```

`initialContent` is read once, when the editor mounts. To show another document, give the editor a new `key`.

## Use it without React

```js
import '@blocknote/mantine/style.css';
import '@vortechron/blocknote-kit/style.css';
import { mountBlockEditor } from '@vortechron/blocknote-kit';

const editor = mountBlockEditor(document.querySelector('#editor'), {
    initialContent: JSON.parse(input.value || '[]'),
    onChange: (document) => (input.value = JSON.stringify(document)),
});

editor.update({ appearance: { backgroundColor: '#f1f5f9' } });
editor.unmount();
```

## Props

| Prop | What it does |
|---|---|
| `initialContent` | The stored document, as an array or JSON text. |
| `onChange(document)` | Called with the whole document after every change. |
| `editable` | `false` for a read-only view. Default `true`. |
| `fonts` | Font picker choices: `{ value, label, stack }`. Empty hides the picker. |
| `uploadFile(file)` | Stores a dropped or pasted file, resolves to its URL. |
| `media` | `{ list, upload }`. Turns on the media library sheet. |
| `appearance` | The section look (see below). |
| `surface` | `false` when your page draws the section surface itself. |
| `trackInsertTargets` | Let `insertText()` drop text into this editor. |
| `onEditorReady(editor)` | The BlockNote editor instance. |
| `blockSpecs` | Your app's own blocks, added to the kit schema. Read once, on mount. |
| `slashMenuItems(editor)` | `/` menu entries for those blocks. |

### `media`

```ts
list({ search, page, kind }) => Promise<{ data: { id, name, url, is_video }[], last_page }>
upload(file) => Promise<unknown>
```

`kind` is `'image'` or `'video'`.

### `appearance`

| Key | Values |
|---|---|
| `backgroundType` | `'color'`, `'image'`, `'video'` (guessed when left out) |
| `backgroundColor` | `'#rrggbb'` |
| `backgroundImageUrl` | a picture URL |
| `backgroundVideoUrl` | a YouTube, Vimeo or Loom link, or an `.mp4` / `.webm` file |
| `tintColor`, `tintOpacity` (0–100), `tintStyle` (`'normal'`, `'blend'`) | a colour over the picture |
| `blur` | 0–20 px |
| `position` | `'center'`, `'top'`, `'top-left'`, ... |
| `card` | put the text on a white card |
| `padding` | `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`. Shrinks on small screens (`FLUID_SPACING`). |
| `contentWidth` | `'narrow'`, `'normal'`, `'wide'`, `'full'` |
| `fullHeight` | grow to most of the screen |

## Building your own editor

Every piece is exported, so you can build your own BlockNote setup with the kit blocks:

```js
import { createKitSchema, kitEditorOptions, kitSlashMenuItems } from '@vortechron/blocknote-kit';

const editor = useCreateBlockNote({ schema: createKitSchema({ fonts }), ...kitEditorOptions() });
```

## Your own blocks

Add blocks only your app has, such as an order button, next to the kit blocks:

```jsx
import { createReactBlockSpec } from '@blocknote/react';
import { insertOrUpdateBlockForSlashMenu } from '@blocknote/core';
import { SPACING_PROP_SCHEMA } from '@vortechron/blocknote-kit';

const orderButton = createReactBlockSpec(
    { type: 'orderButton', propSchema: { label: { default: 'Order now' }, ...SPACING_PROP_SCHEMA }, content: 'none' },
    { render: ({ block }) => <a className="button">{block.props.label}</a> },
);

<BlockEditor
    blockSpecs={{ orderButton: orderButton() }}
    slashMenuItems={(editor) => [{
        title: 'Order button',
        group: 'Sales',
        onItemClick: () => insertOrUpdateBlockForSlashMenu(editor, { type: 'orderButton' }),
    }]}
/>
```

Your server renderer has to draw these blocks too.

## Insert at the caret

```js
import { insertText } from '@vortechron/blocknote-kit';

button.addEventListener('click', () => insertText('{{ customer_name }}'));
```

Turn it on per editor with `trackInsertTargets`. When nothing was focused, the text goes to the clipboard.

## The saved document

The document is BlockNote JSON. The kit adds these props and blocks:

- `width` (1–18) on paragraphs, headings, quotes, code, images, videos, audio, files, tables and column layouts. 12 is a full row. 13 to 18 stretch past the section padding.
- `spaceTop`, `spaceBottom`: `none`, `sm`, `md`, `lg`, `xl`.
- `spacer` with `size`: `sm`, `md`, `lg`, `xl`.
- `card` with `url` (banner), `buttonColor`, `open`. Its children are the body.
- the `fontFamily` text style, holding a font `value`.

To render it on a public page, use the PHP renderer in [vortechron/filament-block-editor](https://github.com/vortechron/filament-block-editor), or BlockNote's own HTML export.

## Development

```bash
npm install
npm test          # unit tests
npm run build     # builds dist/
npm run demo      # http://127.0.0.1:8124, add ?plain for no media library
```

`dist/` is committed, so installing from GitHub needs no build step.

## Licence

GPL-3.0-or-later. See [LICENSE](LICENSE).

The column layout extends [`@blocknote/xl-multi-column`](https://www.blocknotejs.org/docs/features/blocks/layout), which is licensed GPL-3.0 or commercial. The rest of BlockNote is MPL-2.0.
