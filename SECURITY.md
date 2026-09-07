# Security Model — Agent Killer 0.7.1

## Threat model

Agent Killer executes third-party programs. Treat benchmark agents as untrusted code executors.

## Required guarantees

- Evaluation secrets and hidden oracles must not be placed in the writable benchmark project.
- Protected files are hash-checked before and after execution.
- Requests are size-limited and rate-limited.
- Public API mode requires an explicit bearer token.
- Server binds to localhost by default.
- Static serving prevents path traversal.
- API identifiers are syntax-validated before filesystem access.
- Persisted stdout/stderr are bounded.
- Receipts use Ed25519 signatures over canonicalized payloads.
- Submission digests cover the submission payload excluding the integrity and receipt envelopes.

## Deployment guidance

For Internet deployment, place the service behind a reverse proxy with TLS, rotate `AK_API_TOKEN`, isolate the worker host, and use a separate remote verifier for Black Box packs.

Agent Killer is a benchmark harness, not a hostile-code sandbox. A production service should use OS/container isolation and network egress controls appropriate to the threat model.

## Resource governance

Internet-facing deployments must treat execution artifacts as untrusted, bounded data. v0.7.14 enforces TTL, file-count, total-byte, and Black Box record quotas for result artifacts, in addition to active execution, queued-job, workspace-retention, timeout, output, and snapshot limits. Receipt records have a separate lifecycle because they can be authoritative evidence.

## Remote resource governance

Remote orchestration jobs have a bounded wall-clock lifetime. Child executions receive the remaining job budget, preventing suites, gauntlets, killchains, and adversarial suites from extending indefinitely through serial execution.
