# @fleetflow/config

Shared presets consumed by every workspace.

- `tsconfig.base.json` — strict TypeScript defaults (target/lib/module, `strict`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).

Usage:

```json
{ "extends": "@fleetflow/config/tsconfig.base.json" }
```

`apps/mobile` extends `expo/tsconfig.base` instead (Expo owns JSX/RN lib settings) but mirrors the strict flags.
