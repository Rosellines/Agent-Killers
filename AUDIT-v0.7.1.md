# Agent Killer v0.7.1 Security Audit

## Scope

The v0.7.0 release was audited as a hostile public benchmark service. The audit covered filesystem isolation, evaluator trust, receipts, replay, network boundaries, resource exhaustion, API handling, generated challenges, cleanup, leaderboard integrity, and public deployment behavior.

## Findings fixed

| Severity | Finding | Result |
|---|---|---|
| P0 | Official execution was not container-isolated | Fixed: strict mode requires Docker agent execution with network disabled and quotas |
| P0 | Evaluator/oracle race and co-location risk | Fixed: private evaluator is required outside the public tree and oracle calls run in a separate worker process; workspace is frozen before evaluation |
| P0 | Network access relied on detection/heuristics | Fixed: official execution uses Docker `--network none`; adversarial pass requires enforced network isolation |
| P1 | Generated packs were metadata variants | Fixed: generated tasks now contain deterministic parameter sets and generated fixtures |
| P1 | Public submission verified signature but not evidence | Fixed: evidence/result digest verification is mandatory |
| P1 | Replay protection raced | Fixed: atomic `open(..., 'wx')` replay claims |
| P1 | `trust=official` was trusted as data | Fixed: official status comes only from trusted issuer verification |
| P2 | Rate limiter map could grow indefinitely | Fixed: bounded key count plus periodic expiry |
| P2 | Request parsing could allocate oversized payloads | Fixed: content-length guard, streaming byte cap, and 413 response |
| P2 | Error responses exposed internal details | Fixed: stable public error codes with server-side logging |
| P2 | Resource isolation was timeout/output-only | Fixed: strict container CPU/RAM/PID/network/storage controls plus workspace monitor |
| P2 | Cleanup could be skipped on exceptions | Fixed: `finally` cleanup and descendant kill grace handling |
| P2 | Git was not a complete security boundary | Fixed: independent filesystem snapshots, type checks, hardlink/symlink detection, and read-only freeze |

## Additional issues found and fixed

- Version drift between package, runtime, CLI, and UI.
- Timeout descendant processes could outlive the primary child; a delayed SIGKILL remains armed after timeout.
- Leaderboard rows could inherit mutable wrapper fields instead of verified receipt data.
- Black Box commitments now bind the challenge-pool digest.
- Receipt algorithm naming was corrected to match the actual signing construction.

## Residual limitations

No application can provide an absolute guarantee against every vulnerability. Official deployments still require a dedicated worker host, TLS/reverse proxy, secret management, OS hardening, image provenance, dependency updates, monitoring, and controlled retention. The reference evaluator in the public repository is intentionally transparent; blind official evaluation must use the private evaluator boundary described in `docs/OFFICIAL_DEPLOYMENT.md`.
