import { matchFunction, matchMaths, matchVariable } from '../../parser/expressions/matcher';
import { basename, dirname, join } from 'path';
import { Program } from '../../parser/index';
import { Leaf } from '../../parser/types';
import { stripExt } from 'ghoststools';
import { generateLib } from './lib';
import { writeFileSync } from 'fs';
import { macros } from './macros';

interface Line {
    type: Leaf['type'];
    source: string;
    line: string;
}

const escape = (str: string) => {
    return str.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\`/g, '\\`');
};

const parse = (str: string) => {
    str = escape(str);

    str = matchVariable(str, (variable) => {
        return `\$\{${variable}\}`;
    });

    str = matchMaths(str, (maths) => {
        return `\$\{$$eval(\`${maths}\`)\}`;
    });

    str = matchFunction(str, (name, args) => {
        return `\$\{${name}(${args.join(', ')})\}`;
    });

    return `\`${str}\``;
};

const compileProgram = async (program: Program) => {
    const lines: Line[] = [];

    for (const node of program.tree) {
        let line: string = '';

        switch (node.type) {
            case 'blank':
                line = 'console.log();';
                break;

            case 'line':
                line = `console.log(${parse(node.raw)});`;
                break;

            case 'macro': {
                const result = node.runner(program, node);

                if (result) {
                    line = typeof result == 'string' ? result : `(${result})()`;
                }

                break;
            }

            case 'variable':
                line = `var ${node.name} = ${parse(node.value)};`;
                break;

            case 'function':
                // prettier-ignore
                line = `var ${node.name} = (${node.variables.join(', ')}) => ${parse(node.expression)};`;
                break;
        }

        lines.push({
            type: node.type,
            source: node.raw,
            line,
        });
    }

    const result = lines.flatMap((line) => {
        const result = [];

        result.push(`// [${line.type}] "${line.source}"`);
        result.push(`${line.line}\n`);

        return result;
    });

    return {
        code: result.join('\n'),
    };
};

const patchProgram = (program: Program) => {
    for (const [name, runner] of Object.entries(macros)) {
        program.setMacro(name, runner);
    }

    return program;
};

export const compile = async (raw: string, outputPath: string) => {
    const program = patchProgram(new Program());

    program.add(raw);

    const { code } = await compileProgram(program);
    const lib = await generateLib();

    const outputFileName = stripExt(basename(outputPath));
    const libFileName = `${outputFileName}.lib.js`;

    const libPath = join(dirname(outputPath), libFileName);
    const libImport = `import { $$eval } from './${escape(libFileName)}';`;

    writeFileSync(outputPath, `${libImport}\n\n${code}`, 'utf-8');
    writeFileSync(libPath, lib, 'utf-8');
};
