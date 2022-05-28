import * as javascriptCompiler from '../compilers/javascript/compile';
import * as consoleCompiler from '../compilers/console';
import { Program } from '../parser/index';
import { readFileSync } from 'fs';
import minimist from 'minimist';
import { resolve } from 'path';
import kleur from 'kleur';

const args = minimist(process.argv.slice(2));
const [command] = args._;

if (!command || !command.length) {
    throw new Error('No command specified');
}

const resolveFile = (inp?: string) => {
    if (!inp) throw new Error('Please give a file');
    return resolve(inp);
};

const resolveFileData = (inp?: string) => {
    const path = resolveFile(inp);
    return {
        data: readFileSync(path, 'utf8'),
        path,
    };
};

switch (command) {
    case 'run': {
        const [, file] = args._;

        const { data } = resolveFileData(file);
        const program = new Program();

        program.add(data);

        if (args.debug) {
            const line = '='.repeat(15);

            console.log();
            console.log(kleur.bold().green('Debug'));
            console.log(kleur.dim(line));
            console.log(program);
            console.log(kleur.dim(line));
            console.log();
        }

        consoleCompiler.run(program);

        break;
    }

    case 'js': {
        const [, inp, out] = args._;

        const { data } = resolveFileData(inp);
        const path = resolveFile(out);

        const program = new Program();
        program.add(data);

        await javascriptCompiler.compileToFile(program, path);

        console.log(`Compiled to ${inp}!`);
        break;
    }

    case 'parse': {
        const [, inp] = args._;

        const { data } = resolveFileData(inp);
        const program = new Program();

        program.add(data);

        console.log(program);
        break;
    }
}
