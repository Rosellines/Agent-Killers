# Agent Killer v0.7.7 Release Audit

## Purpose
Close the post-v0.7.6 red-team findings around adversarial network evidence semantics, execution-instance attestation, evaluator trust assumptions, generated-pack trust roots, HTTP observability, and redundant receipt verification.

## Findings closed

- `networkPipeDetected` is informational/heuristic and is no longer a PASS hard gate.
- Adversarial network isolation evidence is collected inside the same participant container execution instance.
- Evaluator worker source remains a trusted deployment artifact; its operational integrity is documented as a deployment trust assumption.
- Local generated challenge authenticity is explicitly non-authoritative unless the official generator trust root is configured.
- `/api/verify-submission` preserves generic 404 masking while logging unexpected server/I/O failures for operator observability.
- Official receipt signature verification is computed once and reused for the result/reason decision.

## Release posture

Official adversarial PASS requires verified network isolation evidence from the same participant container execution instance, protected material absent, no exfiltration evidence, clean scope, and deterministic execution.

`networkPipeDetected` is evidence only and is not a security proof.
