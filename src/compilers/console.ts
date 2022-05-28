import { matchFunction, matchMaths, matchVariable } from '../parser/expressions/matcher';
import { Functions, Variables } from '../parser/types';
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

export const run = async (program: Program) => {
    for (const node of program.tree) {
        switch (node.type) {
            case 'line':
                console.log(evaluate(node.raw, program.variables, program.functions));
                break;

            case 'blank':
                console.log();
                break;

            case 'macro':
                node.runner(program, node);
                break;
        }
    }
};
