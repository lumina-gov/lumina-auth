import stylisticTs from "@stylistic/eslint-plugin-ts"
import { includeIgnoreFile } from "@eslint/compat"
import ts from "typescript-eslint"
import globals from "globals"
import { fileURLToPath } from "node:url"

const gitignorePath = fileURLToPath(new URL("./.gitignore", import.meta.url))

/** @type {import('eslint').Linter.Config[]} */
export default [
    includeIgnoreFile(gitignorePath),
    ...ts.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    {
        ignores: ["build/", ".svelte-kit/", ".vercel", "dist/", "css/", "src/lib/queries.ts"]
    },
    {
        plugins: {
            "@stylistic/ts": stylisticTs
        }
    },
    {
        rules: {
            "@stylistic/ts/indent": ["error", 4, {
                SwitchCase: 1,
            }],
            "arrow-parens": ["error", "as-needed", { requireForBlockBody: false }],
            "no-constant-condition": ["error", { checkLoops: false }],
            "no-implicit-coercion": [
                "error",
                {
                    allow: ["!!"]
                }
            ],
            "@stylistic/ts/semi": ["error", "never"],
            "@stylistic/ts/quotes": ["error", "double"],
            "array-element-newline": ["error", "consistent"],
            "no-self-assign": "off",
            "no-empty": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrors: "none"
                }
            ],
            "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
            "@typescript-eslint/no-unused-expressions": "off",
            "@stylistic/ts/object-property-newline": ["error", {}],
            "@stylistic/ts/object-curly-newline": [
                "error",
                {
                    ObjectExpression: {
                        multiline: true,
                        consistent: true,
                        minProperties: 3
                    },
                    ObjectPattern: {
                        multiline: true,
                        consistent: true,
                        minProperties: 3
                    },
                    ImportDeclaration: {
                        multiline: true,
                        consistent: true,
                        minProperties: 4
                    }
                }
            ]
        }
    }
]
