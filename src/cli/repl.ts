import { runNode } from '../compilers/console';
import { createInterface } from 'readline';
import { Program } from '../parser/index';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

const getLine = () =>
    new Promise<string>((resolve) => {
        rl.question('> ', (line) => resolve(line));
    });

export const repl = async () => {
    const program = new Program();

    while (true) {
        const line = await getLine();

        program.add(line);
        runNode(program, program.tree[program.tree.length - 1]);
    }
};
