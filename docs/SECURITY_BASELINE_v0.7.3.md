# Agent Killer v0.7.4 — Zero-Trust Security Baseline

This release treats every participant artifact as hostile. The official execution path is fail-closed and requires Linux, Docker, a pinned seccomp policy, an explicit AppArmor profile, a private evaluator module, an evaluator SHA-256 pin, and an operator-managed trusted issuer key.

## Isolation boundary

Participant code and participant tests execute only in disposable containers. The workspace is a container `tmpfs`; the host repository is never bind-mounted as `/workspace`. Only the final disposable workspace state is exported after the container exits. Extra mounts are read-only and intended for evaluator material only.

## Resource boundary

Official containers use CPU, memory, swap, PID, file-descriptor, `/tmp`, and `/workspace` tmpfs quotas. The host runner additionally enforces snapshot file-count and byte limits and command output limits.

## Network boundary

Official participant containers use `--network none`. The adversarial lane also executes an independent in-container network probe covering DNS, IPv4 TCP, IPv6 TCP, and HTTP. A configuration flag alone is not treated as proof.

## Evaluator trust

Private evaluator code must live outside the public distribution and must match `AK_EVALUATOR_SHA256`. Trusted result artifacts are signed by the configured issuer key. An `official` string, local JSON file, or self-signed receipt is never sufficient by itself.

## Receipt protocol

Receipts use canonicalized Ed25519 signatures with claim IDs, nonces, issuance time, expiry, claimant identity, and evidence digests. Public submission requires a trusted issuer, signed trusted-result artifacts, claimant proof, and atomic replay protection.

## Fail-closed rule

If a production requirement cannot be proven, official execution is rejected rather than silently downgraded to an insecure local mode.

## Verification boundary

The development environment used for packaging this release did not provide a live Docker daemon. Therefore the release tests prove fail-closed behavior and all non-Docker security logic locally, but do not claim live kernel-level container escape resistance from this environment. Production release must run the Docker-backed integration gate on the target Linux host before enabling public remote execution.
