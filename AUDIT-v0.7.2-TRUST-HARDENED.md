# Agent Killer v0.7.2 — Trust-Hardened Audit

## Review disposition
All 12 reported findings were treated as actionable. No finding was waived when it affected participant isolation, proof integrity, or public-trust semantics.

### Fixed
1. Untrusted participant/test code is not permitted to execute on the host in production paths. Official and untrusted execution require Docker isolation.
2. Strict official mode rejects `builtin` participants. Builtin reference mode is development-only.
3. Adversarial network status is derived from the actual sandbox execution result, not from a configuration flag alone.
4. Generated challenges now carry explicit variant identity and deterministic parameter sets. A 100-variant reference compatibility sweep passed 100/100 visible and 100/100 hidden cases.
5. Public submissions require trusted evaluator evidence in addition to an issuer signature.
6. Receipt replay claims are atomic and bound to claimant identity.
7. Official status is derived from signature, trusted issuer identity, evidence verification, wrapper integrity, and claimant proof; the stored `trust` field is not itself authoritative.
8. Rate-limiter state is bounded and garbage-collected.
9. Request bodies are capped at 128 KiB before JSON materialization.
10. Public errors use stable public codes and never return internal stack traces.
11. Official execution uses Linux Docker with network disabled, memory/CPU/PID/file-descriptor/tmpfs limits, dropped capabilities, no-new-privileges, and workspace size/file-count enforcement.
12. Cleanup runs in `finally` paths; container execution also attempts forced container removal after command completion/timeout.
13. Git is informational only; filesystem snapshots are authoritative for patch scope. Hardlinks are flagged before file contents are read.

### Additional fixes discovered during review
- Hidden evaluation copies the participant workspace into a disposable evaluation workspace before execution.
- Generated CSV hidden fixtures are JSON-escaped and were validated against the reference solution.
- Smoke tests use OS-assigned ephemeral ports rather than fixed ports.
- Passport schema/algorithm metadata was synchronized to receipt v5.
- Public submission receipts are bound to a claimant public key and claimant signature to prevent bearer-receipt front-running.
- Leaderboard rows are sourced from verified official submissions in public mode.

## Release-gate evidence
- `npm test` — PASS
- `npm run validate` — PASS
- `npm run self-test` — PASS (55/55)
- `npm run v07-self-test` — PASS (15/15)
- `npm run smoke-api` — PASS
- `npm run smoke-public` — PASS
- Generated compatibility sweep — PASS (100/100 visible, 100/100 hidden)

## Explicit environment boundary
The audit environment does not provide a live Docker daemon. Therefore the test environment can verify strict-mode refusal, sandbox construction, resource-policy arguments, and all non-container paths, but it cannot claim a live Docker kernel-isolation proof from this machine. Production official evaluation must run on Linux with a healthy Docker daemon and the private evaluator configured outside the participant distribution.

## Trust principle
A valid signature proves that a trusted issuer signed a payload. It does not, by itself, prove that the payload came from a valid benchmark execution. Agent Killer v0.7.2 therefore requires the evidence chain and trusted-result records before accepting an official public submission.
