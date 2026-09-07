# Contributing to Agent Killer

Agent Killer treats benchmark integrity as a first-class requirement.

Before opening a pull request:

```bash
npm run verify
node tests/api.smoke.mjs
```

New benchmarks should have deterministic visible and hidden checks, at least one meaningful mutation when applicable, a declared category/difficulty, and no oracle material inside the writable fixture.

Do not submit API keys, private receipts, generated runtime artifacts, or hidden evaluator material.
