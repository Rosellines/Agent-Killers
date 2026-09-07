# Agent Killer v0.7.14 Audit

## Resource governance hardening

- Added an authoritative per-remote-job wall-clock lifetime budget (`AK_MAX_JOB_LIFETIME_MS`, default 30 minutes, hard ceiling 60 minutes).
- Propagated the job deadline through suite, adversarial-suite, gauntlet, and killchain orchestration into each child execution.
- Child execution timeout is clamped to the remaining job budget, preventing a child from extending the parent job beyond its deadline.
- Timeout/lifetime exhaustion aborts the orchestration instead of silently continuing through remaining children.
- Renamed the remote concurrency semantics to `MAX_ACTIVE_JOBS` / `AK_MAX_ACTIVE_JOBS`; the legacy `AK_MAX_ACTIVE_EXECUTIONS` environment variable remains accepted as a compatibility alias.
- Per-caller governance remains enforced with `MAX_ACTIVE_JOBS_PER_CALLER`, and queued work remains bounded by `MAX_QUEUED_JOBS`.

## Assurance limitation

Live Docker/kernel enforcement remains unverified in this audit environment because no Docker daemon is available. Source-level container hardening and fail-closed logic remain testable.
