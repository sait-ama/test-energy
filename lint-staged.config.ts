import * as path from 'path';
import type { Configuration } from 'lint-staged';

const eslintCommand = (filenames: string[]): string => {
    const files = filenames.map((f) => path.relative(process.cwd(), f)).join(' ');
    return `eslint --fix ${files}`;
};

const formatCommand = 'prettier --write';

const config: Configuration = {
    '{apps,packages}/**/*.{js,jsx,ts,tsx}': [formatCommand, eslintCommand],
};

export default config;
