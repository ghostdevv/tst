import type { Program } from '../parser';

export const run = async (program: Program) => {
    for (const node of program.tree) {
        switch (node.type) {
            case 'line':
                console.log(node.parsed);
                break;

            case 'blank':
                console.log();
                break;

            case 'macro':
                node.runner(program);
                break;
        }
    }
};
