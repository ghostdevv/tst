import { functionRegex, variableRegex } from './expressions/matcher';
import { FunctionNode, Functions, Variables } from './types';
import { createErrorManager } from './errors';

export const validateLine = (line: string, variables: Variables, functions: Functions) => {
    const em = createErrorManager();

    for (const match of line.match(variableRegex) || []) {
        const variable = match.slice(1, -1);

        if (!variables.has(variable)) {
            throw em.fatal('Error', `Unable to find variable "${variable}"`);
        }
    }

    for (const match of line.match(functionRegex) || []) {
        const em = createErrorManager('', 'Format: {fm[var1 var2 etc]}');
        const call = match.slice(1, -2);

        const [name, argsString] = call.split('[');

        if (!name || !name.length) {
            throw em.fatal('ParseError', 'Unable to find function name');
        }

        if (!argsString || !argsString.length) {
            throw em.fatal('ParseError', 'Unable to find function args');
        }

        if (!functions.has(name)) {
            throw em.fatal('Error', `Unable to find function "${name}"`);
        }

        const args = argsString.split(' ').filter(Boolean);
        const data = functions.get(name);

        if (data.variables.length != args.length) {
            throw em.fatal(
                'ParseError',
                `Function arguments do not match, requires ${data.variables.length} but found ${args.length}`,
            );
        }
    }
};

export const validateFunctionExpression = (
    node: FunctionNode,
    variables: Variables,
    functions: Functions,
) => {
    const scopedVariables = new Map(Object.entries(variables));

    for (const variable of node.variables) {
        scopedVariables.set(variable, '__MOCK_VALUE__');
    }

    validateLine(node.expression, scopedVariables, functions);
};
