import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { tst } from './tst.js';

const config = {
    preprocess: [tst()],

    kit: {
        adapter: adapter(),
    },
};

export default config;
