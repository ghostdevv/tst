import kleur from 'kleur';

type ErrorType = 'Error' | 'ParseError';

export const createErrorManager = (prefix?: string, suffix?: string) => {
    return {
        fatal: (type: ErrorType, error: string) => {
            const $ = [
                // prettier-ignore
                `${kleur.bold('[')}${kleur.bgRed(` ${type} `)}${kleur.bold(']')}`,
            ];

            if (prefix) {
                $.push(kleur.dim(prefix));
            }

            $.push(kleur.bold().underline(error));

            if (suffix) {
                $.push(kleur.dim(suffix));
            }

            console.error(...$);
            process.exit(1);
        },

        setSuffix: (newSuffix: string) => {
            suffix = newSuffix;
        },
    };
};
