import { FunctionNode, Functions, Leaf, MacroRunner, UnparsedNode, Variables } from './types';
import { validateFunctionExpression, validateLine } from './validator';
import { createErrorManager } from './errors';
import * as config from '../config';
import { nanoid } from 'nanoid';

export class Program {
    public tree: Leaf[];
    public variables: Variables;
    public functions: Functions;
    public macros: Map<string, MacroRunner>;

    constructor() {
        this.tree = [];
        this.variables = new Map();
        this.functions = new Map();
        this.macros = new Map(Object.entries(config.macros));
    }

    setMacro(name: string, runner: MacroRunner) {
        this.macros.set(name, runner);
    }

    add(code: string) {
        for (let line of code.split('\n')) {
            const node: UnparsedNode = {
                type: 'raw',
                raw: line,
                id: nanoid(),
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

        const em = createErrorManager('Invalid Statement.', 'Format: $ name = value');

        if (!expression || !expression.length) {
            throw em.fatal('ParseError', 'Unable to find a value');
        }

        if (!name || !name.length) {
            throw em.fatal('ParseError', 'Unable to find a name');
        }

        if (name.includes(' ')) {
            throw em.fatal('ParseError', `Variable name "${name}" must not contains spaces`);
        }

        if (this.variables.has(name) || this.functions.has(name)) {
            throw em.fatal('Error', `Variable or function "${name}" already exists`);
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

            validateFunctionExpression(fnNode, this.variables, this.functions);

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
            throw em.fatal('ParseError', `Macro name malformed, found "${macro}".`);
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

        validateLine(node.raw, this.variables, this.functions);

        this.tree.push({
            ...node,
            type: 'line',
        });
    }
}
