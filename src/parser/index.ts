import { FunctionNode, Leaf, UnparsedNode } from './types';
import { createErrorManager } from './errors';
import { Evaluator } from './Evaluator';
import * as config from '../config';

export class Program {
    public tree: Leaf[];
    public variables: Map<string, string>;
    public functions: Map<string, FunctionNode>;
    public macros: Map<string, (program: Program) => void>;

    constructor() {
        this.tree = [];
        this.variables = new Map();
        this.functions = new Map();
        this.macros = new Map(Object.entries(config.macros));
    }

    add(code: string) {
        for (let line of code.split('\n')) {
            const node: UnparsedNode = {
                type: 'raw',
                raw: line,
            };

            switch (line.trim()[0]) {
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
        let [name, expression] = node.raw.split('=');

        name = name.trim().replace(/^\$( )?/g, '');

        const em = createErrorManager(
            'Invalid Statement.',
            'Format: $ name = value',
        );

        if (!expression || !expression.length) {
            throw em.fatal('ParseError', 'Unable to find a value');
        }

        if (!name || !name.length) {
            throw em.fatal('ParseError', 'Unable to find a name');
        }

        if (expression.trimStart().startsWith('|')) {
            em.setSuffix('Format: $ x = |var var2 etc| expression');

            const variablesMatch = expression.match(/(?<=\|)([\w ])*(?=\|)/g);

            if (!variablesMatch || !variablesMatch.length) {
                throw em.fatal(
                    'ParseError',
                    `Detected a function but unable to find variables, found ${expression}`,
                );
            }

            expression = expression
                .trimStart()
                .replace(/^\|([\w ])*\|/g, '')
                .slice(1);

            if (!expression || !expression.length) {
                throw em.fatal(
                    'ParseError',
                    `Unable to find expression for function, found ${expression}`,
                );
            }

            const variables = variablesMatch[0].split(' ');

            if (!variables.length || variables.some((x) => x.trim() == '')) {
                throw em.fatal('ParseError', 'Missing function variable name');
            }

            const fnNode: FunctionNode = {
                ...node,
                name,
                type: 'function',
                expression,
                variables,
            };

            this.tree.push(fnNode);
            this.functions.set(name, fnNode);
        } else {
            const value = expression.slice(1);

            this.variables.set(name, value);

            this.tree.push({
                ...node,
                type: 'variable',
                value,
                name,
            });
        }
    }

    parseMacro(node: UnparsedNode) {
        const em = createErrorManager('Invalid Statement', 'Format: # macro');
        const [hash, macro] = node.raw.trim().split(' ');

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

        const evaluator = new Evaluator(this.variables, this.functions);

        this.tree.push({
            ...node,
            type: 'line',
            parsed: evaluator.evaluate(node.raw),
        });
    }
}
