import type { UserConfig } from '@commitlint/types';

const Configuration: UserConfig = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [2, 'always', ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'merge', 'build', 'ci', 'revert']],
        'subject-case': [1, 'always', ['lower-case', 'upper-case', 'camel-case', 'kebab-case', 'pascal-case', 'sentence-case', 'snake-case', 'start-case']],
    },
};

export default Configuration;
