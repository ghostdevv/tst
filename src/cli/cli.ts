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

switch (command) {
    case 'run': {
        const [, file] = args._;

        if (!file) throw new Error('Please give a file');

        const path = resolve(file);
        const data = readFileSync(path, 'utf8');

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
}
