import { matchFunction, matchMaths, matchVariable } from '../parser/expressions/matcher';
import { Functions, Leaf, Variables } from '../parser/types';
import maths from 'math-expression-evaluator';
import type { Program } from '../parser';

const evaluate = (line: string, variables: Variables, functions: Functions) => {
    line = matchVariable(line, (variable) => {
        return variables.get(variable);
    });

    line = matchFunction(line, (name, args) => {
        const scopedVariables = new Map(Object.entries(variables));
        const data = functions.get(name);

        for (let i = 0; i < data.variables.length; i++) {
            scopedVariables.set(data.variables[i], args[i]);
        }

        return evaluate(data.expression, scopedVariables, functions);
    });

    line = matchMaths(line, (statement) => {
        return maths.eval(statement);
    });

    return line;
};

export const runNode = (program: Program, node: Leaf) => {
    switch (node.type) {
        case 'line':
            console.log(evaluate(node.raw, program.variables, program.functions));
            break;

        case 'blank':
            console.log();
            break;

        case 'macro': {
            const result = node.runner(program, node);

            if (result) {
                typeof result == 'string' ? console.log(result) : result();
            }

            break;
        }
    }
};

export const run = (program: Program) => {
    for (const node of program.tree) {
        runNode(program, node);
    }
};
