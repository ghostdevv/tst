import { matchFunction, matchVariable } from '../parser/expressions/matcher';
import { Program } from '../parser/index';
import { Leaf } from '../parser/types';

interface Line {
    type: Leaf['type'];
    source: string;
    line: string;
}

const escape = (str: string) => {
    return str.replace(/"/g, '\\"').replace(/'/g, "\\'").replace(/\`/g, '\\`');
};

const evaluate = (str: string) => {
    str = matchVariable(str, (variable) => {
        return `\$\{${variable}\}`;
    });

    str = matchFunction(str, (name, args) => {
        return `\$\{${name}(${args.join(', ')})}\}`;
    });

    return str;
};

export const compile = (program: Program) => {
    const result: Line[] = [];

    const parse = (expression: string) => {
        return `\`${evaluate(escape(expression))}\``;
    };

    for (const node of program.tree) {
        let line: string;

        switch (node.type) {
            case 'blank':
                line = 'console.log();';
                break;

            case 'line':
                line = `console.log(${parse(node.raw)});`;
                break;

            case 'macro':
                line = `(${node.runner})();`;
                break;

            case 'variable':
                line = `var ${node.name} = ${parse(node.value)};`;
                break;

            case 'function':
                // prettier-ignore
                line = `var ${node.name} = (${node.variables.join(', ')}) => ${parse(node.expression)};`;
                break;
        }

        result.push({
            type: node.type,
            source: node.raw,
            line,
        });
    }

    return result.flatMap((x) => [`// [${x.type}] "${x.source}"`, x.line, '']).join('\n');
};
