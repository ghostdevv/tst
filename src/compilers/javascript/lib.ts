import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import virtual from '@rollup/plugin-virtual';
import { rollup } from 'rollup';

const lib = `
import maths from 'math-expression-evaluator';

export function _tst_math_(str) {
    return maths.eval(str);
}
`.trim();

export const generateLib = async () => {
    const rollupInstance = await rollup({
        input: 'entry',
        plugins: [virtual({ entry: lib }), commonjs(), nodeResolve()],
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
