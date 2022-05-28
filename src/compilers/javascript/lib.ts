import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { rollup } from 'rollup';
import { join } from 'desm';

export const generateLib = async () => {
    const rollupInstance = await rollup({
        input: join(import.meta.url, './runtime.js'),
        plugins: [commonjs(), nodeResolve()],
    });

    const { output } = await rollupInstance.generate({
        format: 'esm',
    });

    const chunks: string[] = [];

    for (const chunk of output) {
        if (chunk.type == 'chunk') {
            chunks.push(chunk.code);
        }
    }

    return chunks.join('\n');
};
