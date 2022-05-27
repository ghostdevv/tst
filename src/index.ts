import { FunctionNode, Leaf, UnparsedNode } from './types';
import maths from 'math-expression-evaluator';
import { createErrorManager } from './errors';
import * as config from './config';

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

    evaluateString(str: string, variables = this.variables) {
        // Match variables
        str = str.replace(/{([\w\d]+)}/g, (match, variable) => {
            const em = createErrorManager();

            if (!variables.has(variable)) {
                throw em.fatal(
                    'Error',
                    `Unable to find variable "${variable}"`,
                );
            }

            return variables.get(variable);
        });

        // Match functions
        str = str.replace(/{[\w\d]+\[([\w\d ]+)\]}/g, (match) => {
            const em = createErrorManager('', 'Format: {fm[var1 var2 etc]}');
            const dec = match.trim().slice(1, -2);

            const [name, argsString] = dec.split('[');

            if (!name || !name.length) {
                throw em.fatal('ParseError', 'Unable to find function name');
            }

            if (!argsString || !argsString.length) {
                throw em.fatal('ParseError', 'Unable to find function args');
            }

            if (!this.functions.has(name)) {
                throw em.fatal('Error', `Unable to find function "${name}"`);
            }

            const data = this.functions.get(name);
            const args = argsString.split(' ');

            if (data.variables.length != args.length) {
                throw em.fatal(
                    'ParseError',
                    `Function arguments do not match, requires ${data.variables.length} but found ${args.length}`,
                );
            }

            const scopedVariables = new Map(Object.entries(variables));

            for (let i = 0; i < data.variables.length; i++) {
                scopedVariables.set(data.variables[i], args[i]);
            }

            const parsed = this.evaluateString(
                data.expression,
                scopedVariables,
            );

            return parsed;
        });

        // Match maths
        str = str.replace(/\(([^()])+\)/g, (match) => {
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

        return str;
    }

    parseLine(node: UnparsedNode) {
        if (node.raw.trim() == '')
            return void this.tree.push({
                ...node,
                type: 'blank',
            });

        this.tree.push({
            ...node,
            type: 'line',
            parsed: this.evaluateString(node.raw),
        });
    }
}
