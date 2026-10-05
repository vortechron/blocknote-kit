import * as esbuild from 'esbuild';

/**
 * The library build. React and BlockNote stay as imports (they are peer
 * dependencies), so the app bundles them once, in the version it chose.
 */
await esbuild.build({
    entryPoints: ['src/index.js'],
    outfile: 'dist/index.js',
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: ['es2020'],
    jsx: 'automatic',
    loader: { '.js': 'jsx' },
    packages: 'external',
    logLevel: 'info',
});

await esbuild.build({
    entryPoints: ['src/style.css'],
    outfile: 'dist/style.css',
    bundle: true,
    logLevel: 'info',
});
