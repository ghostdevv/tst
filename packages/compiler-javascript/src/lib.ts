import urlResolve from 'rollup-plugin-url-resolve';
import commonjs from '@rollup/plugin-commonjs';
import virtual from '@rollup/plugin-virtual';
import { rollup } from 'rollup';

const lib = `
import maths from 'https://cdn.skypack.dev/math-expression-evaluator?min';

export function _tst_math_(str) {
    return maths.eval(str);
}
`.trim();

export const generateLib = async () => {
    const rollupInstance = await rollup({
        input: 'entry',
        plugins: [
            virtual({ entry: lib }),
            urlResolve(),
            commonjs({
                // Use commonjs with skypack
                include: /^https:\/\/cdn.skypack\.dev/,
            }),
        ],
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
