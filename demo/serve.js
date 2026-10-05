import * as esbuild from 'esbuild';

/**
 * Serves the demo at http://127.0.0.1:8124. Rebuilds on every request.
 */
const context = await esbuild.context({
    entryPoints: { main: 'demo/main.jsx' },
    outdir: 'demo/build',
    bundle: true,
    format: 'esm',
    jsx: 'automatic',
    loader: { '.js': 'jsx', '.woff2': 'file', '.woff': 'file' },
    conditions: ['style'],
    define: { 'process.env.NODE_ENV': '"development"' },
    logLevel: 'info',
});

const port = Number(process.env.PORT ?? 8124);
const { hosts } = await context.serve({ servedir: 'demo', host: '127.0.0.1', port });

console.log(`Demo running at http://${hosts[0]}:${port}`);
