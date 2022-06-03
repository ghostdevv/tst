import { createErrorManager } from '@tstlang/parser';
import type { MacroRunner } from '@tstlang/parser';

const em = createErrorManager();

export const macros: Record<string, MacroRunner> = {
    export: (program, node) => {
        const index = program.tree.findIndex((x) => x.id == node.id);

        if (isNaN(index)) {
            throw em.fatal('ParseError', 'Unable to find index of export macro');
        }

        const next = program.tree[index + 1];

        if (!next || !['variable', 'function'].includes(next.type)) {
            throw em.fatal(
                'ParseError',
                'Invalid use of export macro, ensure next node is a variable or function',
            );
        }

        return 'export';
    },
};
