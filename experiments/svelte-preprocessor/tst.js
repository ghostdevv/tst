import { compile } from '../../dist/compilers/javascript/compile.js';

/** @type {import("svelte-preprocess/dist/types").PreprocessorGroup} */
const runner = {
    script: async ({ attributes, content }) => {
        if (attributes.lang == 'tst') {
            attributes.lang = null;

            return {
                code: await compile(content),
            };
        }

        return {
            code: content,
        };
    },
};

export const tst = () => runner;
