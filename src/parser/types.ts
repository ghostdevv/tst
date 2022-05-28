import type { Program } from './index';

export interface Node {
    type: string;
    raw: string;
    id: string;
}

export interface UnparsedNode extends Node {
    type: 'raw';
}

export interface LineNode extends Node {
    type: 'line';
}

export interface VariableNode extends Node {
    type: 'variable';
    name: string;
    value: string;
}

export interface FunctionNode extends Node {
    type: 'function';
    name: string;
    variables: string[];
    expression: string;
}

export interface MacroNode extends Node {
    type: 'macro';
    runner: MacroRunner;
}

export interface BlankNode extends Node {
    type: 'blank';
}

export type Leaf = MacroNode | VariableNode | LineNode | BlankNode | FunctionNode;

export type MacroRunner = (program: Program, node: Leaf) => void;

export type Variables = Map<string, string>;
export type Functions = Map<string, FunctionNode>;
