import { compile } from '../../dist/compilers/javascript/compile.js';

/** @type {import("svelte-preprocess/dist/types").PreprocessorGroup} */
export const tst = {
    script: async ({ attributes, content }) => {
        if (attributes.lang == 'tst') {
            return {
                code: await compile(content),
            };
        }

        return {
            code: content,
        };
    },
};
