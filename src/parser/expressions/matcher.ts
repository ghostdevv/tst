import { createErrorManager } from '../errors';

export const variableRegex = /{([\w\d]+)}/g;
export const functionRegex = /{[\w\d]+\[([\w\d ]+)\]}/g;
export const mathsRegex = /\(([^()])+\)/g;

export const matchVariable = (line: string, callback: (variable: string) => string) =>
    line.replace(variableRegex, (match, variable) => callback(variable));

export const matchMaths = (line: string, callback: (maths: string) => string) =>
    line.replace(mathsRegex, (match) => callback(match.slice(1, -1)));

export function matchFunction(line: string, callback: (name: string, args: string[]) => string) {
    return line.replace(functionRegex, (match) => {
        match = match.trim().slice(1, -2);

        const em = createErrorManager('', 'Format: {fm[var1 var2 etc]}');
        const [name, argsString] = match.split('[');

        if (!name || !name.length) {
            throw em.fatal('ParseError', 'Unable to find function name');
        }

        if (!argsString || !argsString.length) {
            throw em.fatal('ParseError', 'Unable to find function args');
        }

        const args = argsString.split(' ').filter(Boolean);

        return callback(name, args);
    });
}
