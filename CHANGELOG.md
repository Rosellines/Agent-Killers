## 0.7.15 — Replay Integrity & Public Submission Hardening

- Bound official receipt lifetime at issuance and verification.
- Bound replay-marker retention to receipt validity; active receipt claims are never pruned.
- Added paginated public submission responses with bounded page size and short-lived verification cache.
- Added compensation cleanup when submission persistence fails after a replay claim.
- Hardened historical version tests to validate behavior rather than pinning prior release numbers.

## 0.7.15 — Submission & Replay Lifecycle Hardening

- Added bounded TTL/file/byte governance for submission records and replay locks.
- Added indexed lifecycle pruning with startup reconciliation and periodic maintenance.
- Preserved receipt/trusted-result lifecycle as separate evidence policies.
- Added regression coverage for stale submissions and replay markers.

## 0.7.15

- Replaced per-write O(N) result artifact pruning with indexed heap/counter lifecycle governance.
- Added bounded TTL, file-count, and byte policies for trusted result records.
- Added startup and periodic reconciliation for artifact indexes.
- Added v0.7.15 lifecycle hardening regression coverage.

# Changelog

## 0.7.15 — Artifact Resource Governance Hardening

- Added bounded execution-result and blackbox artifact retention by TTL, file count, and total bytes.
- Added dedicated blackbox record quota.
- Added lifecycle pruning at write-time and server startup/interval.
- Fixed freeze-workspace CI cleanup regression.
- Canonicalized current release metadata to v0.7.15.

## 0.7.10 — Filesystem Snapshot Flood Hardening

- Added total filesystem entry, directory, symlink, and hardlink snapshot limits.
- Counted every directory entry before type-specific processing.
- Switched snapshot directory traversal to streaming `opendir()` iteration.
- Added regression coverage for symlink, hardlink, and directory floods.


## 0.7.6 — Evidence & Zero-Trust Hardening

- Removed participant-visible secret/canary material from adversarial workspaces.
- Moved official hidden/mutation evaluator execution into a dedicated pinned evaluator container boundary.
- Added robust workspace cleanup and fail-safe lifecycle handling.
- Added deny-by-default participant environment enforcement.
- Hardened generated-pack validation and version/fingerprint checks.
- Clarified network policy vs actual network-isolation evidence.
- Added package-lock and dependency audit coverage.
- Added dedicated v0.7.6 trust-hardening regression coverage.
# Changelog

## 0.7.2 — Trust Hardened & P0/P1/P2 Security Fixes

- container-only official execution with network=none and resource quotas
- private evaluator executed out-of-process and required outside the public distribution
- immutable filesystem snapshots plus workspace freeze before evaluation
- cryptographic evidence verification for public submissions
- atomic receipt replay protection
- leaderboard derives identity and score from verified receipts
- bounded rate limiter and request body parsing
- sanitized public errors
- guaranteed cleanup paths
- parametric generated challenge variants

# Agent Killer Changelog

## 0.7.0 — The Agent Trial
- Added 15 executable long-horizon and benchmark-integrity trials (AK-041..AK-055).
- Added v0.7 CLI commands for suite, self-test, list, and deathmatch.
- Added v0.7 public trial/status API endpoints.
- Added deterministic task metadata for difficulty, category, and trial identity.
- Added benchmark-integrity Roselline Test as a first-class executable challenge.

# Changelog

## 0.6.1 — Trust Hardened

This release hardens Agent Killer for hostile benchmark participants and public-facing verification workflows.

### Security and integrity
- Independent filesystem snapshots replace Git as the sole patch-scope authority.
- Deleting or rewriting `.git` no longer hides collateral modifications.
- Symlinks are detected and fail the integrity gate.
- Workspace file-count and size limits reduce filesystem-exhaustion risk.
- Child stdout/stderr is capped and process groups are terminated on timeout/output-bomb conditions.
- Benchmark child environments are allowlisted; `NODE_OPTIONS`, API tokens, signing keys, and common secret variables are removed.
- Public API agent execution is disabled unless an operator explicitly enables strict official mode.
- Strict official mode requires a private evaluator module and an OS network sandbox.
- Public result/job endpoints are protected by authentication.

### Verification
- Self-attested receipts are explicitly non-official.
- Official submissions require a receipt signed by a trusted issuer public key.
- Receipt replay is rejected.
- Submission identity is tied to provider/model/version and receipt identity.
- Official leaderboard entries are separated from local/self-attested results.

### Benchmark quality
- Generated packs now include deterministic parametric variants rather than only renamed task metadata.
- CSV generated variants and other edge cases are covered by reference-solver regression tests.
- Adversarial scenarios use independent snapshots for scope enforcement.
- Black Box production mode uses server-side HMAC commitments; caller-controlled seeds remain local/demo-only.

### Release gate
- Core tests: PASS
- Platform tests: PASS
- Security/red-team tests: PASS
- 40/40 reference tasks: PASS
- 40/40 hidden reference checks: PASS
- 40/40 mutation checks: PASS
- API smoke test: PASS

## 0.7.3 — Zero-Trust Clean Baseline
- Participant execution moved to disposable container `tmpfs`; no host `/workspace` bind mount.
- Official mode now fail-closes without Linux Docker, pinned seccomp, AppArmor profile, private evaluator, and evaluator SHA-256 pin.
- Extra container mounts are read-only only; Docker socket is never mounted.
- Workspace, submissions, trusted results, receipts, and signing keys move to the runtime root outside the repository.
- Mutation testing now mutates the reference solution so frozen participant workspaces do not break the mutation lane.
- Generated variants bind benchmark, generator, and oracle versions into fingerprints.
- Black-box commitments bind canonical challenge content and benchmark version.
- Trusted-result artifacts are cryptographically signed and verified.
- Claimant signatures bind the receipt nonce; official receipts have expiry.
- API body/timeouts and crypto verification rate limits hardened.
- `validate` executes representative generated + adversarial behavior instead of static claims only.
- Added v0.7.3 security baseline and regression gate.

## 0.7.4 — Zero-Trust Arena Hardening
- Removed private hidden-oracle mounts from participant evaluation paths.
- Added external private hidden-evaluator request protocol over stdin.
- Added cryptographic seccomp/AppArmor content pinning requirements.
- Added actual network probe evidence and fail-closed official adversarial execution.
- Added stricter image requirements and runtime boundary validation.
- Improved truthful validation and release security documentation.

## 0.7.6 — Zero-Trust Evidence Hardening
- Participant environment is deny-by-default with no arbitrary environment passthrough.
- Protected secret/canary material is no longer provisioned inside participant workspaces.
- Deterministic reruns execute independently and compare canonical execution evidence.
- Generated challenge packs are Ed25519-signed; strict official mode can require a trusted generator key.
- Trusted official leaderboard scores are recomputed from verified trusted-result artifacts.
- Container mount policy explicitly rejects Docker socket and host pseudo-filesystem targets.
- Filesystem snapshot detects in-flight file replacement during hashing.

## 0.7.7 — Adversarial Evidence Semantics

- Removed `networkPipeDetected` from the adversarial PASS gate; it remains informational evidence.
- Added same-container network isolation probe evidence for adversarial participant executions.
- Added explicit security-gate and heuristic separation in adversarial results.
- Added post-v0.7.6 regression coverage and release audit.
- Added operator logging for unexpected `/api/verify-submission` failures while preserving public 404 masking.
- Avoided duplicate Ed25519 verification in official receipt validation.

## 0.7.10
- Remote workspace retention is fail-closed and bounded by operator-only enablement, TTL, and retained-workspace quota.
- Execution timeout is clamped to 15 minutes and suite cardinality/execution budgets are enforced.
- Output limits are byte-accurate for UTF-8 data.
