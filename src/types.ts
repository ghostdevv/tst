import type { Program } from './index';

export interface Node {
    type: string;
    raw: string;
}

export interface UnparsedNode extends Node {
    type: 'raw';
    raw: string;
}

export interface LineNode extends Node {
    type: 'line';
    parsed: string;
}

export interface VariableNode extends Node {
    type: 'variable';
    name: string;
    value: string;
}

export interface MacroNode extends Node {
    type: 'macro';
    runner: MacroRunner;
}

export interface BlankNode extends Node {
    type: 'blank';
}

export type Leaf = MacroNode | VariableNode | LineNode | BlankNode;
export type MacroRunner = (program: Program) => void;
