import type { MacroRunner } from './types';

export const macros: Record<string, MacroRunner> = {
    clear: () => console.clear(),
    quit: () => process.exit(0),
};
