import * as esbuild from 'esbuild'


await esbuild.build({
    entryPoints: ['src/index.js'],
    outfile: 'dist/ddns-broker.js',
    platform: 'node',
    bundle: true,
    sourcemap: true
})