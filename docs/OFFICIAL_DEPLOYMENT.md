# Official Deployment — Agent Killer 0.7.1

Agent Killer has two modes:

- **Local/reference mode**: intended for reproducibility and development. The open-source evaluator may be visible and local execution is not a hostile-code security boundary.
- **Official mode**: intended for a dedicated worker environment. It refuses to execute agents unless a private evaluator is configured outside the repository and Docker isolation is available.

## Required official controls

Set:

```bash
AK_OFFICIAL_MODE=1
AK_PUBLIC=1
AK_API_TOKEN=<random-high-entropy-token>
AK_TRUSTED_ISSUER_PUBLIC_KEY=<operator-public-key>
AK_BLACKBOX_SECRET=<random-high-entropy-secret>
AK_EVALUATOR_MODULE=/opt/agent-killer-private/evaluator.mjs
AK_AGENT_CONTAINER_IMAGE=<operator-maintained-agent-image>
AK_CPU_LIMIT=2
AK_MEMORY_LIMIT=2g
AK_PIDS_LIMIT=256
AK_DISK_LIMIT=256m
```

The private evaluator must be stored outside the public repository distribution. The agent image must contain only the tools and credentials intentionally granted to the participant process. The official Docker runner uses `--network none`, drops Linux capabilities, enables `no-new-privileges`, limits CPU/RAM/PIDs, bounds file descriptors, and uses a storage quota where the Docker runtime supports it.

## Evidence trust chain

An official score is accepted only when:

1. the receipt is signed by the configured trusted issuer key;
2. the submitted evidence bundle hashes to the receipt's signed evidence digest;
3. result IDs match the signed receipt;
4. the wrapper record is internally integrity-checked;
5. the receipt has not previously been claimed.

Cryptographic receipts prove that the configured issuer signed a specific evidence statement. They do not by themselves prove that the host or issuer is honest. Keep the private issuer key on the evaluator/worker only.

## Network boundary

Do not rely on prompts or shell-command heuristics for network isolation. Official agent execution uses Docker's network namespace with `--network none`. Run the worker behind a hardened host/reverse proxy and do not mount the Docker socket into participant containers.

## Operational requirements

Use TLS, secret management, worker health monitoring, structured logs with secret redaction, resource monitoring, backup/retention policy, and regular container/runtime updates. Treat the public API as hostile input.

## Artifact resource governance

Execution result, suite, adversarial, DNA/human, and Black Box records are bounded by server-side retention and quota controls. Defaults can be tuned with `AK_ARTIFACT_RETENTION_TTL_MS`, `AK_MAX_RESULT_ARTIFACT_FILES`, `AK_MAX_RESULT_ARTIFACT_BYTES`, and `AK_MAX_BLACKBOX_RECORDS`. These controls apply to execution artifacts, not signed receipt records; keep long-term authoritative receipts/submissions in their dedicated trust stores.
