# Agent Killer v0.7.15 Audit

## Scope
Submission records and replay-marker lifecycle governance were hardened without changing the official receipt trust model.

## Controls
- Submission records: bounded TTL, file-count, and byte quotas.
- Replay markers: bounded TTL, file-count, and byte quotas.
- Startup reconciliation rebuilds indexes; periodic pruning maintains bounded storage.
- Replay markers are created atomically with `wx` and remain outside the trusted-result lifecycle.

## Assurance limitation
Live Docker/kernel enforcement remains unverified in the audit environment.
