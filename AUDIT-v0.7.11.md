# Agent Killer v0.7.11 Release Audit

## Resource Governance

- Result/blackbox execution artifacts are bounded by file count, byte budget, and TTL.
- Blackbox records have a dedicated maximum record count.
- Artifact pruning runs on write and on server lifecycle sweeps.
- Receipt records are excluded from execution-artifact pruning and retain their separate trust lifecycle.

## CI Reliability

- v0.7.9 freeze-workspace regression test restores permissions before cleanup.

## Security Boundary

- MAX_ACTIVE_EXECUTIONS, MAX_QUEUED_JOBS, and MAX_ACTIVE_PER_CALLER remain enforced.
- Live Docker/kernel enforcement remains environment-dependent and must be independently verified before production security claims.
