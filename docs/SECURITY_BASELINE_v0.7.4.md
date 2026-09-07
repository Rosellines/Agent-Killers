# Agent Killer v0.7.4 — Zero-Trust Baseline

## Boundary
Participant code never receives the private hidden oracle. Official hidden evaluation is delegated to a private evaluator service configured with `AK_HIDDEN_EVALUATOR_COMMAND`. The public repository deliberately does not contain the production oracle.

## Container
Official participant execution requires Linux + Docker, digest-pinned image, hash-pinned seccomp, hash-pinned AppArmor policy, non-root execution, no network, no socket mounts, private IPC/PID/UTS namespaces, read-only root filesystem, and tmpfs workspace.

## Evidence
Network isolation must be proven by runtime probes; a configuration flag is not accepted as proof.

## Important
The local mock/reference path is development-only and is not a security proof for official benchmark results.

## Hidden evaluator protocol
In official mode, `AK_HIDDEN_EVALUATOR_COMMAND` receives a canonical JSON request over stdin containing the task, benchmark version, project path, and project digest. The private evaluator is responsible for copying the artifact into its own sandbox before executing any candidate code. The public participant container never receives the hidden oracle.
