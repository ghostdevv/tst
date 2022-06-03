import type { Options } from 'tsup';

export const tsup: Options = {
    splitting: false,
    sourcemap: false,
    clean: true,
    dts: true,
    keepNames: true,
    target: 'esnext',
    format: ['esm'],
    entryPoints: ['src/index.ts'],
    outDir: 'dist',
};
