import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends("next/core-web-vitals", "next/typescript"),
	...nextVitals,
	{
		rules: {
			"react/no-unescaped-entities": "off",
			"@next/next/no-page-custom-font": "off",
		},
		globalIgnores: ["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"],
	},
];

export default eslintConfig;
