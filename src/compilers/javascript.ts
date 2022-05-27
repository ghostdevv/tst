import { Program } from '../parser/index';
import { Leaf } from '../parser/types';

interface Line {
    type: Leaf['type'];
    source: string;
    line: string;
}

const escape = (str: string) => str.replace(/"/g, '\\"').replace(/'/g, "\\'");

export const compile = (program: Program) => {
    const result: Line[] = [];

    for (const node of program.tree) {
        let line: string;

        switch (node.type) {
            case 'blank':
                line = 'console.log();';
                break;

            case 'line':
                line = `console.log('${escape(node.raw)}')`;
                break;

            case 'macro':
                line = `(${node.runner})();`;
                break;

            case 'variable':
                line = `var ${node.name} = '${escape(node.value)}';`;
                break;

            case 'function':
                // prettier-ignore
                line = `var ${node.name} = (${node.variables.join(', ')}) => '${escape(node.expression)}';`;
                break;
        }

        result.push({
            type: node.type,
            source: node.raw,
            line,
        });
    }

    return result
        .flatMap((x) => [`// [${x.type}] "${x.source}"`, x.line, ''])
        .join('\n');
};
