#!/usr/bin/env node
import * as javascriptCompiler from '@tstlang/compiler-javascript';
import * as consoleCompiler from '@tstlang/compiler-console';
import { Program } from '@tstlang/parser';
import { readFileSync } from 'fs';
import minimist from 'minimist';
import { resolve } from 'path';
import { repl } from './repl';
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

        await javascriptCompiler.compile(data, path);

        console.log(`Compiled to ${out}!`);
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

    case 'repl': {
        repl();
        break;
    }

    default: {
        throw new Error(`Command ${command} not found`);
        break;
    }
}
