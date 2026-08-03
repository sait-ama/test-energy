module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2020": true,
        "node": true
    },
    "globals": {
        "React": true,
        "JSX": true,
        "NodeJS": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:jsx-a11y/recommended",
        "eslint-config-prettier"
    ],
    "plugins": ["react", "react-hooks"],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true,
        },
    },
    rules: {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "no-unused-vars": [1, { argsIgnorePattern: "^_" }],
        "jsx-a11y/no-autofocus": 0,
        "react/jsx-key": 0,
        "react/no-unescaped-entities": 0
        // "import/no-duplicates": "error",
        // "import/no-unresolved": "error",
        // "import/named": "error",
        // "react/no-typos": "error",
        // "react/no-unused-state": "warn",
        // "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
        // "react-hooks/exhaustive-deps": "warn", // Checks effect dependencies
        // "react/jsx-uses-react": "off",
        // "react/react-in-jsx-scope": "off",
        // "array-callback-return": "error",
        // "semi": [1, "always"],
        // "react/prop-types": 0
    },
};
