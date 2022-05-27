import maths from 'math-expression-evaluator';
import { createErrorManager } from './errors';
import { Leaf, UnparsedNode } from './types';
import * as config from './config';

export class Program {
    public tree: Leaf[];
    public variables: Map<string, string>;
    public macros: Map<string, (program: Program) => void>;

    constructor() {
        this.tree = [];
        this.variables = new Map();
        this.macros = new Map(Object.entries(config.macros));
    }

    add(code: string) {
        for (let line of code.split('\n')) {
            const node: UnparsedNode = {
                type: 'raw',
                raw: line,
            };

            switch (line[0]) {
                case '$':
                    this.parseStatement(node);
                    break;

                case '#':
                    this.parseMacro(node);
                    break;

                default:
                    this.parseLine(node);
                    break;
            }
        }
    }

    parseStatement(node: UnparsedNode) {
        const [dollar, name, equals, ...valueArray] = node.raw.split(' ');

        const em = createErrorManager(
            'Invalid Statement.',
            'Format: $ name = value',
        );

        if (dollar !== '$') {
            throw em.fatal('ParseError', `$ malformed, found "${dollar}".`);
        }

        if (equals !== '=') {
            throw em.fatal('ParseError', `= Malformed, found "${equals}".`);
        }

        if (!name || name.trim() == '') {
            throw em.fatal('ParseError', `Name is empty, found "${name}".`);
        }

        if (valueArray.length == 0 || valueArray.every((x) => x.trim() == '')) {
            throw em.fatal(
                'ParseError',
                `Value is empty, found "${valueArray}".`,
            );
        }

        const value = valueArray.join(' ');

        this.variables.set(name, value);

        this.tree.push({
            ...node,
            type: 'variable',
            name,
            value,
        });
    }

    parseMacro(node: UnparsedNode) {
        const em = createErrorManager('Invalid Statement', 'Format: # macro');
        const [hash, macro] = node.raw.split(' ');

        if (hash !== '#') {
            throw em.fatal('ParseError', `# malformed, found "${hash}".`);
        }

        if (!macro || macro.trim() == '') {
            throw em.fatal(
                'ParseError',
                `Macro name malformed, found "${macro}".`,
            );
        }

        if (!this.macros.has(macro)) {
            throw em.fatal('Error', `Unable to find macro "${macro}"`);
        }

        this.tree.push({
            ...node,
            type: 'macro',
            runner: this.macros.get(macro),
        });
    }

    parseLine(node: UnparsedNode) {
        if (node.raw.trim() == '')
            return void this.tree.push({
                ...node,
                type: 'blank',
            });

        let parsed = node.raw;

        parsed = parsed.replace(/{([\w\d]+)}/g, (match, variable) => {
            const em = createErrorManager();

            if (!this.variables.has(variable)) {
                throw em.fatal(
                    'Error',
                    `Unable to find variable "${variable}"`,
                );
            }

            return this.variables.get(variable);
        });

        parsed = parsed.replace(/\(([^()])+\)/g, (match) => {
            const statement = match.slice(0, -1);

            const em = createErrorManager(
                `Unable to parse maths statement "${statement}",`,
            );

            try {
                return maths.eval(statement);
            } catch (e) {
                throw em.fatal('ParseError', e?.message);
            }
        });

        this.tree.push({
            ...node,
            type: 'line',
            parsed,
        });
    }
}
