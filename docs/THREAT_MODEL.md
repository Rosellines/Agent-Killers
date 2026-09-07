# Agent Killer 0.7.1 Threat Model

## Trust zones

- Participant workspace: fully hostile. The agent may attempt arbitrary code execution, filesystem manipulation, process spawning, environment inspection, and network access.
- Public verifier: semi-trusted web service. It never accepts a client claim as an official score and does not run arbitrary agents in public mode.
- Official evaluator: private operator-controlled component outside the public distribution.
- Official agent runner: disposable Linux container with `--network none`, CPU/RAM/PID quotas, dropped capabilities, no-new-privileges, bounded disk/storage policy, and a mounted workspace only.

## Security invariants

1. Official scores require a receipt signed by the configured trusted issuer key.
2. The receipt's signed evidence digest must match the submitted evidence bundle.
3. Submission replay is blocked by an atomic `wx` claim lock.
4. Leaderboards derive identity and score from a verified receipt, never a mutable wrapper field.
5. Participant modifications are measured from an independent filesystem snapshot; Git is not a security boundary.
6. Official evaluation refuses to run without the private evaluator and container isolation.
7. Public errors expose stable error codes rather than stack traces or filesystem details.
8. Request parsing is size-bounded before JSON parsing and rate limiter state is bounded.
9. Evaluation is performed after the participant workspace is frozen read-only.

## Residual operational requirements

A production deployment still needs an isolated worker host, a reverse proxy/TLS boundary, secret management, log redaction, monitoring, backup/retention policy, and regular dependency/image updates. No application-layer sandbox can replace a hardened host.
