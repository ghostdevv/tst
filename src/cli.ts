import { Program } from './index';
import { readFileSync } from 'fs';
import minimist from 'minimist';
import { resolve } from 'path';
import { run } from './run';
import kleur from 'kleur';

const args = minimist(process.argv.slice(2));
const [file] = args._;

if (!file) throw new Error('Please give a file');

const path = resolve(file);
const data = readFileSync(path, 'utf8');

const program = new Program();

program.add(data);

if (args.debug) {
    const line = '======================================================';

    console.log();
    console.log(kleur.bold().green('Debug'));
    console.log(kleur.dim(line));
    console.log(program);
    console.log(kleur.dim(line));
    console.log();
}

run(program);
