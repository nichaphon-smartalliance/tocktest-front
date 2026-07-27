    import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "public/**",
      // Playwright E2E tests are not Next.js/React app code. Its `use()`
      // fixture API trips React's rules-of-hooks; lint it with Playwright
      // tooling instead, not the Next config.
      "e2e/**",
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // Allow intentional unused bindings prefixed with _ (e.g. omit-key
      // destructuring: `const { selected: _selected, ...rest } = obj`).
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // setState-in-effect is a React performance advisory ("not recommended"),
    // not a correctness rule. These files use it intentionally and correctly:
    //   - mount-time init that is SSR-unsafe (localStorage / matchMedia)
    //   - subscriptions to browser/external stores
    //   - form fields initialized/reset from fetched data or props on open
    // Kept as an error everywhere else so new violations are still caught.
    files: [
      "src/components/ui/ClientOnly.tsx",
      "src/context/theme/ThemeProvider.tsx",
      "src/components/layout/AdminLayout/AdminLayout.tsx",
      "src/components/layout/AdminLayout/Header/Header.tsx",
      "src/components/partials/Settings/SettingsContent.tsx",
      "src/components/partials/AdminSettings/AdminSettingsContent.tsx",
      "src/components/partials/Analysis/AnalysisContent.tsx",
      "src/components/partials/TestCases/InlineChipPicker.tsx",
      "src/components/partials/TestCases/Modal/AiGenerateModal.tsx",
      "src/components/partials/TestCases/Modal/TestCaseModal.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    // Intentional: heroui ships a prebuilt stylesheet copied to /public and
    // linked in the document head; avatars are user data-URLs from localStorage
    // where next/image optimization does not apply.
    files: [
      "src/app/layout.tsx",
      "src/components/layout/AdminLayout/Header/Header.tsx",
      "src/components/partials/AdminSettings/AdminSettingsContent.tsx",
    ],
    rules: {
      "@next/next/no-css-tags": "off",
      "@next/next/no-img-element": "off",
    },
  },
  {
    // Unit tests legitimately use `any` for mock shaping.
    files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.test.ts", "**/*.test.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
