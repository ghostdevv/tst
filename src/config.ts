import type { MacroRunner } from './parser/types';

export const macros: Record<string, MacroRunner> = {
    clear: () => console.clear(),
    quit: () => process.exit(0),
};
