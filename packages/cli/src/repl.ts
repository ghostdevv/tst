import { runNode } from '@tstlang/compiler-console';
import { createInterface } from 'readline';
import { Program } from '@tstlang/parser';

export const repl = async () => {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const getLine = () =>
        new Promise<string>((resolve) => {
            rl.question('> ', (line) => resolve(line));
        });

    const program = new Program();

    while (true) {
        const line = await getLine();

        program.add(line);
        runNode(program, program.tree[program.tree.length - 1]);
    }
};
