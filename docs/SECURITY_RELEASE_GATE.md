# Agent Killer Security Release Gate

A release is not considered suitable for an official benchmark deployment merely because the visible tests pass.

## Mandatory properties

1. The participant workspace is isolated from evaluator internals.
2. Patch scope is measured from an independent filesystem snapshot.
3. Protected files, symlinks, deletions, and `.git` destruction are observable.
4. Process output is bounded and timeouts terminate the full process group where supported.
5. Agent environment variables are allowlisted.
6. Official network execution requires OS/container isolation with network egress blocked by policy.
7. The public API cannot execute arbitrary agents unless strict official mode is enabled by the operator.
8. Public leaderboard entries require an operator-trusted issuer signature.
9. Self-attested receipts are never promoted to official status.
10. Receipt replay and signature tampering are rejected.
11. Black Box commitments use a server-side secret in production.
12. Generated challenge identities are deterministic and include a generator/version lineage.

## Important trust boundary

The open-source repository intentionally contains a transparent local/reference evaluator for reproducibility. This is not a secret oracle.

For a real blind benchmark, the operator must deploy a private evaluator package through `AK_EVALUATOR_MODULE` and keep it outside the participant distribution. The official worker signs receipts with a key whose public key is configured at the verifier as `AK_TRUSTED_ISSUER_PUBLIC_KEY`.

Agent Killer is a benchmark verifier, not a universal hostile-code sandbox. An official Internet deployment should use a dedicated worker host, OS/container isolation, outbound network policy, resource quotas, and a reverse proxy/TLS layer.
