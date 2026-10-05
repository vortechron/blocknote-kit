import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@blocknote/mantine/style.css';
import '../src/style.css';
import { BlockEditor } from '../src/index.js';

/** A media library kept in memory, the way an app would back it with an API. */
const library = [];

const media = {
    async list({ search = '', page = 1, kind }) {
        const found = library
            .filter((asset) => asset.name.toLowerCase().includes(search.toLowerCase()))
            .filter((asset) => ! kind || (kind === 'video') === asset.is_video);

        return { data: found.slice((page - 1) * 24, page * 24), last_page: Math.max(1, Math.ceil(found.length / 24)) };
    },
    async upload(file) {
        library.unshift({ id: library.length + 1, name: file.name, url: URL.createObjectURL(file), is_video: file.type.startsWith('video/') });
    },
};

const uploadFile = async (file) => URL.createObjectURL(file);

const fonts = [
    { value: 'georgia', label: 'Georgia', stack: "Georgia, 'Times New Roman', serif" },
    { value: 'helvetica', label: 'Helvetica', stack: 'Helvetica, Arial, sans-serif' },
];

const looks = {
    Plain: {},
    Navy: { backgroundColor: '#1e1b4b', padding: 'xl', contentWidth: 'wide' },
    'Light grey': { backgroundColor: '#f1f5f9' },
    Picture: {
        backgroundType: 'image',
        backgroundImageUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="#0f766e"/><stop offset="1" stop-color="#4338ca"/></linearGradient></defs><rect width="1200" height="600" fill="url(#g)"/></svg>'),
        tintOpacity: 30,
        padding: 'lg',
    },
    'Picture + card': {
        backgroundImageUrl: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><rect width="1200" height="600" fill="#be185d"/></svg>'),
        card: true,
        padding: 'lg',
    },
};

const starter = [
    { type: 'heading', props: { level: 1, textAlignment: 'center' }, content: [{ type: 'text', text: 'Build a section', styles: {} }] },
    { type: 'paragraph', props: { textAlignment: 'center' }, content: [{ type: 'text', text: 'Type "/" for columns, a spacer or a card. Hover an item and drag its edge to resize it.', styles: {} }] },
    {
        type: 'columnList',
        props: {},
        children: [
            { type: 'column', props: { width: 1 }, children: [{ type: 'paragraph', props: [], content: [{ type: 'text', text: 'Left column', styles: [] }] }] },
            { type: 'column', props: { width: 1 }, children: [{ type: 'paragraph', props: [], content: [{ type: 'text', text: 'Right column', styles: [] }] }] },
        ],
    },
];

/** Open the demo with ?plain to see the editor with no media library and no fonts. */
const plain = new URLSearchParams(window.location.search).has('plain');

function Demo() {
    const [look, setLook] = useState('Plain');
    const [document, setDocument] = useState(starter);

    return (
        <>
            <div className="controls">
                Section look:
                {Object.keys(looks).map((name) => (
                    <button key={name} type="button" aria-pressed={look === name} onClick={() => setLook(name)}>{name}</button>
                ))}
            </div>
            <BlockEditor
                initialContent={starter}
                onChange={setDocument}
                fonts={plain ? [] : fonts}
                uploadFile={uploadFile}
                media={plain ? undefined : media}
                appearance={looks[look]}
                trackInsertTargets
            />
            <pre id="document">{JSON.stringify(document, null, 2)}</pre>
        </>
    );
}

createRoot(window.document.getElementById('app')).render(<Demo />);
