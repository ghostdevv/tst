import { createErrorManager } from './errors';
import maths from 'math-expression-evaluator';
import { Program } from '.';

export class Evaluator {
    public static readonly variableRegex = /{([\w\d]+)}/g;
    public static readonly functionRegex = /{[\w\d]+\[([\w\d ]+)\]}/g;
    public static readonly mathsRegex = /\(([^()])+\)/g;

    constructor(
        public readonly variables: Program['variables'],
        public readonly functions: Program['functions'],
    ) {}

    evaluate(str: string) {
        // Match variables
        str = str.replace(Evaluator.variableRegex, (match, variable) => {
            const em = createErrorManager();

            if (!this.variables.has(variable)) {
                throw em.fatal(
                    'Error',
                    `Unable to find variable "${variable}"`,
                );
            }

            return this.variables.get(variable);
        });

        // Match functions
        str = str.replace(Evaluator.functionRegex, (match) => {
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
            const args = argsString.split(' ').filter(Boolean);

            if (data.variables.length != args.length) {
                throw em.fatal(
                    'ParseError',
                    `Function arguments do not match, requires ${data.variables.length} but found ${args.length}`,
                );
            }

            const scopedVariables = new Map(Object.entries(this.variables));

            for (let i = 0; i < data.variables.length; i++) {
                scopedVariables.set(data.variables[i], args[i]);
            }

            const evaluator = new Evaluator(scopedVariables, this.functions);
            const parsed = evaluator.evaluate(data.expression);

            return parsed;
        });

        // Match maths
        str = str.replace(Evaluator.mathsRegex, (match) => {
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
}
