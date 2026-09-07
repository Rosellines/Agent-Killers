# ☠️ AGENT KILLER
## The Agent Trial — Where Coding Agents Come to Prove They Can Survive.
<p align="center">  <img src="assets/agent-killer-logo.png" alt="Agent Killer — The Agent Trial" width="520"></p>\n\n**Current release: v0.7.15**  

**Benchmark edition: v0.7.11**  
**Open source: MIT**  
**Built by Rosellines × Mikasa**
**Current release: v0.7.15**  
**Benchmark edition: v0.7.11**  
**Open source: MIT**  
**Built by Rosellines × Mikasa**

> **Can you prove you are the best agent?**
>
> Agent Killer is not a leaderboard of vibes. It is an evidence-first benchmark arena for coding agents and human engineers, designed to test not only whether an agent can produce a correct patch, but whether it can survive hostile instructions, protect scope, pass hidden checks, kill mutations, reproduce its result, and produce evidence that another party can verify.

[![Open Source](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-339933.svg)](package.json)
[![Security](https://img.shields.io/badge/security-zero--trust--oriented-111827.svg)](SECURITY.md)

---

## Table of Contents

- [Why Agent Killer Exists](#why-agent-killer-exists)
- [What Makes It Different](#what-makes-it-different)
- [Features](#features)
- [Benchmark Tracks](#benchmark-tracks)
- [How Scoring Works](#how-scoring-works)
- [Evidence and Trust Model](#evidence-and-trust-model)
- [Security Posture](#security-posture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Run a Real Agent](#run-a-real-agent)
- [Run the Arena](#run-the-arena)
- [Black Box and Challenge Generation](#black-box-and-challenge-generation)
- [Human Trial](#human-trial)
- [Cryptographic Receipts and Submissions](#cryptographic-receipts-and-submissions)
- [Public / Official Deployment](#public--official-deployment)
- [API Overview](#api-overview)
- [Repository Structure](#repository-structure)
- [Configuration](#configuration)
- [Version History](#version-history)
- [Roadmap](#roadmap)
- [Open Source and Contributing](#open-source-and-contributing)
- [Security Disclosure](#security-disclosure)
- [Known Limitations](#known-limitations)
- [License](#license)

---

## Why Agent Killer Exists

Modern coding agents can generate patches that look convincing in seconds. That makes a simple "did the tests pass?" benchmark increasingly insufficient.

Real engineering work also asks:

- Can the agent understand an unfamiliar repository instead of pattern-matching the prompt?
- Can it make a narrow change without silently modifying unrelated files?
- Can it survive ambiguous requirements, repository noise, hostile instructions, and deceptive artifacts?
- Can it recover after a failed attempt?
- Can it produce tests strong enough to kill mutated implementations?
- Can the result be reproduced instead of accepted because one run happened to pass?
- Can an evaluator distinguish a self-reported score from independently verifiable evidence?

**Agent Killer exists to make those questions executable.**

The project treats an agent as an adversarial participant and the benchmark as a chain of evidence. Correctness matters, but so do scope discipline, safety, reproducibility, mutation resistance, speed, cost, and identity.

---

## What Makes It Different

### 1. Correctness is only one dimension

A patch can pass a visible test and still be weak. Agent Killer combines visible checks, hidden checks, mutation testing, independent filesystem snapshots, deterministic reruns, and security hygiene.

### 2. Scope is measured independently of Git

Git is useful evidence, but it is not the sole security boundary. Agent Killer compares filesystem snapshots before and after execution so that deleting `.git`, hiding files, or manipulating Git metadata cannot become a substitute for a clean patch.

### 3. Hidden evaluation is separated from participant workspaces

In official mode, hidden/mutation evaluation is performed by an operator-controlled private evaluator outside the public distribution and, for sensitive paths, inside a dedicated evaluator container.

### 4. Official results are cryptographically verifiable

Official submissions depend on an Ed25519 trust chain: trusted issuer → signed receipt → result/evidence digests → claimant proof → replay protection.

### 5. Resource abuse is treated as part of the benchmark threat model

Agent Killer places bounds on execution time, concurrency, queue depth, workspace size, output volume, snapshot entries, artifacts, trusted results, submissions, and replay markers.

### 6. The benchmark can test the benchmark

The **Roselline Test** is a first-class benchmark-integrity trial. The project is intended to be adversarially reviewed, not merely trusted because the author says it is correct.

---

## Features

### 🧠 Agent DNA

Generate a multidimensional behavioral profile rather than a single number. Observable dimensions include reasoning, implementation, debugging, architecture, security, tool discipline, recovery, honesty proxy, context efficiency, and autonomy.

### ☠️ Nightmare / Gauntlet Trials

Longer sequences combine discovery, construction, breakage, repair, defense, and proof. The goal is to expose failure modes that disappear when every benchmark item is isolated.

### 🛡️ Adversarial Reality

Exercises may include prompt injection, deceptive repository content, scope traps, noise, permission boundaries, protected material, and adversarial network scenarios.

### 🧬 Mutation War

Reference solutions are mutated and the benchmark checks whether candidate tests actually kill the mutation. This discourages shallow or overly specific tests.

### 🔐 Evidence Reliability

Agent Killer records observable execution evidence. It does **not** inspect private chain-of-thought or claim to read an agent's mind.

### 🤖 Model × Provider × Version × Harness identity

A result carries agent identity plus provider, model, model version, harness version, benchmark version, and task lineage so comparisons do not silently merge materially different systems.

### 🎲 Agent Roulette

Randomized challenge selection supports repeatable trials without letting the participant choose only favorable tasks in sealed/official configurations.

### 🔥 Kill Chain / Death Match

Multi-stage survival flows and head-to-head comparisons turn isolated patches into arena-style trials.

### 🕳️ Black Box

Production Black Box mode can publish a server-side commitment before revealing the selected challenge, making post-hoc challenge selection detectable.

### 🧪 Deterministic Challenge Generator

Generated packs preserve seed, source lineage, generator version, parameters, variant identity, and fingerprints so a generated task can be independently reproduced and authenticated in official mode.

### 🏆 Verified World Leaderboard

Official leaderboard rows are derived from verified receipts and trusted evidence rather than accepting client-supplied score fields.

### 👤 Human Trial

Human engineers can run the same benchmark engine in a dedicated human lane for direct human-vs-agent comparisons.

### 💸 Quality / Speed / Cost Frontier

Runtime and optional estimated cost are captured beside quality so a score can be evaluated in operational context rather than as a single raw number.

### 🌐 Public Submission API

The server supports authenticated official submission intake, bounded pagination, verification, rate limits, replay protection, and lifecycle governance.

---

## Benchmark Tracks

| Track | Purpose | Typical signal |
|---|---|---|
| **Core** | Real engineering correctness | Visible + hidden behavior |
| **Mutation** | Test strength | Mutation kill rate |
| **Adversarial** | Safety and instruction resistance | Scope/security/network evidence |
| **Gauntlet** | Long-horizon resilience | Survival across stages |
| **Kill Chain** | Cascading failure recovery | Multi-stage recovery |
| **Black Box** | Challenge secrecy | Commitment / reveal integrity |
| **Human** | Human baseline | Same observable evaluator |
| **Roselline Test** | Benchmark integrity | Detect evaluator/trust weaknesses |
| **Generated** | Scalable parametric coverage | Seeded/fingerprinted variants |
| **Death Match** | Direct comparison | Same edition, different agents |

The benchmark currently ships **55 reference tasks**, including **15 v0.7 pressure trials (AK-041 through AK-055)**.

> **Versioning note:** `0.7.15` is the software/release version. `v0.7.11` is retained as the identifier of the existing v0.7 benchmark edition and its historical trial contract. It is not the package version.

---

## How Scoring Works

For a core run, the current evaluator separates:

- **Correctness** — visible and hidden checks.
- **Test quality** — mutation-killing performance.
- **Patch quality** — independent patch-scope integrity and oracle integrity.
- **Security** — protected-material hygiene and illegal filesystem artifacts.
- **Efficiency** — bounded runtime signal.
- **Reproducibility** — deterministic observable rerun agreement.

A core task is scored on a 100-point scale. The benchmark deliberately exposes component checks rather than hiding everything behind one opaque score.

At arena level, when both core and adversarial tracks exist:

```text
arenaScore = 70% core average + 30% adversarial pass rate
```

The exact scoring contract should be treated as part of the benchmark version and task-pack lineage. Do not compare scores across materially different benchmark editions without recording the edition and pack identity.

---

## Evidence and Trust Model

Agent Killer separates three concepts:

```text
Execution
   ↓
Evaluation
   ↓
Verification
```

### Local / reference mode

The public repository intentionally contains a transparent reference evaluator. This is for reproducibility, development, benchmark authoring, and local experiments. It is **not** a secret oracle and is not itself proof of a production benchmark operator's honesty.

### Official mode

An official deployment uses an operator-controlled private evaluator outside the public repository. Official execution fails closed unless required controls are present.

The official evidence chain is designed around:

```text
trusted issuer key
      ↓
Ed25519 receipt
      ↓
result IDs + score + identity
      ↓
result/evidence digests
      ↓
claimant proof
      ↓
atomic replay claim
      ↓
official leaderboard
```

Self-attested receipts remain useful locally but are explicitly non-official.

---

## Security Posture

The project is intentionally designed around a hostile participant model.

### Security controls currently implemented

- Deny-by-default participant environment handling.
- Independent filesystem snapshots for patch-scope enforcement.
- Snapshot entry, file, directory, symlink, hardlink, and byte limits.
- Streaming directory traversal for snapshot collection.
- Bounded stdout/stderr and process timeout handling.
- Remote execution concurrency and queue governance.
- Parent job wall-clock deadlines propagated into child executions.
- Bounded execution-result, trusted-result, submission, and replay storage lifecycles.
- Paginated public submission listing with bounded page size and verification caching.
- Official receipt lifetime hard cap.
- Replay protection tied to receipt validity.
- Claim compensation when submission persistence fails after a replay claim.
- Generated challenge signatures and fingerprint validation.
- Private evaluator requirement in official mode.
- Pinned evaluator/image requirements in strict execution.
- `--network none` plus runtime network evidence for official adversarial execution.
- No Docker socket mount in participant containers.
- Dropped Linux capabilities, `no-new-privileges`, resource quotas, and disposable workspaces in official container mode.
- Fail-closed behavior when required official security controls cannot be proven.

### What the project does not claim

Agent Killer does **not** claim that application code alone proves a universal hostile-code sandbox. The production worker host, Linux kernel, Docker/container runtime, seccomp profile, AppArmor policy, image provenance, credentials, network policy, monitoring, and deployment process remain part of the trust boundary.

The audit environment used for this release did not provide a live Docker daemon. Therefore source-level container configuration and fail-closed behavior can be verified here, but live kernel enforcement and independent container-escape resistance are **not claimed as verified**.

See:

- [`SECURITY.md`](SECURITY.md)
- [`docs/SECURITY_RELEASE_GATE.md`](docs/SECURITY_RELEASE_GATE.md)
- [`docs/OFFICIAL_DEPLOYMENT.md`](docs/OFFICIAL_DEPLOYMENT.md)
- [`docs/THREAT_MODEL.md`](docs/THREAT_MODEL.md)

---

## Installation

### Requirements

- Node.js **20+**
- Git
- A Unix-like environment is recommended for official execution.
- Docker is required for strict official participant/evaluator execution.

### Clone

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd agent-killer
```

### Install dependencies

```bash
npm install
```

The project includes a lockfile for reproducible dependency installation.

### Verify the installation

```bash
npm run verify
```

A successful release verification should finish with:

```text
RELEASE VERIFY CLEAN PASS
```

> `npm run verify` creates an isolated temporary runtime root for the verification run so results, submissions, replay markers, and other lifecycle state from an earlier local run do not silently contaminate the release gate.

---

## Quick Start

### List tasks

```bash
npx agent-killer list
```

### List installed agent adapters

```bash
npx agent-killer agents
```

### Run one reference challenge

```bash
npx agent-killer run mock AK-001
```

### Run the full 55-task reference self-test

```bash
npm run self-test
```

### Run the v0.7 pressure edition

```bash
npx agent-killer v07 list
npx agent-killer v07 self-test
npx agent-killer v07 suite mock
```

### Start the dashboard/API locally

```bash
npm start
```

Then open:

```text
http://127.0.0.1:3947
```

The server binds to localhost by default.

---

## Run a Real Agent

First inspect the adapters available on your machine:

```bash
node src/cli.js agents
```

Then run an adapter against a task:

```bash
node src/cli.js run <agent-id> AK-001
```

Example:

```bash
node src/cli.js run codex AK-001
```

Useful metadata flags:

```bash
node src/cli.js run codex AK-001 \
  --provider openai \
  --model <model-name> \
  --version <model-version>
```

For local debugging, a workspace can be retained when the CLI path explicitly requests it:

```bash
node src/cli.js run codex AK-001 --keep
```

Remote/public execution does not trust arbitrary client retention settings; official server governance applies its own lifecycle limits.

---

## Run the Arena

### Gauntlet

```bash
npm run gauntlet -- mock
```

### Kill Chain

```bash
npm run killchain -- mock
```

### Roulette

```bash
npm run roulette -- mock
```

### Black Box

```bash
npm run blackbox
```

### Agent DNA

```bash
npm run dna -- results/<suite-file>.json
```

### Provider/model matrix

```bash
npm run matrix
```

---

## Black Box and Challenge Generation

### Black Box

A production verifier can create a server-controlled commitment before a challenge is revealed. The selected task is bound to the challenge context without exposing a convenient pre-selection path to the participant.

### Deterministic generation

Generate a local pack:

```bash
npx agent-killer generate 50 rosellines-001
```

Generated task metadata contains source lineage, seed, variant parameters, generator version, and fingerprint information.

In official mode, generated-pack authenticity depends on a trusted generator public key configured by the operator. Local/demo signed packs should not be treated as a global trust root.

---

## Human Trial

Start a human workspace:

```bash
node src/cli.js human start AK-001
```

Solve the task manually, then grade it:

```bash
node src/cli.js human grade <workspace-directory>
```

The human lane uses the same observable evaluation concepts so the comparison stays meaningful.

---

## Cryptographic Receipts and Submissions

### Create local signing material

```bash
node src/cli.js keygen
```

### Create a local submission

```bash
node src/cli.js submit results/<suite>.json <agent-id> \
  --provider openai \
  --model <model-name> \
  --version <model-version>
```

### Verify a receipt

```bash
node src/cli.js verify-receipt <receipt-file>
```

### Verify a stored submission

```bash
node src/cli.js verify-submission <submission-id>
```

### Official submissions

A production verifier should accept an official receipt only when:

1. the issuer public key is trusted by the verifier;
2. the receipt signature is valid;
3. the receipt lifetime is valid and within the configured hard ceiling;
4. the signed result/evidence digests match;
5. trusted result records verify correctly;
6. claimant proof is valid;
7. the claim has not already been consumed by replay protection.

A self-signed/local receipt must remain labeled **non-official**.

---

## Public / Official Deployment

Public mode is an operator deployment feature, not the default local workflow.

At minimum, the operator needs a deployment-specific setup containing:

```bash
AK_PUBLIC=1
AK_API_TOKEN=<long-random-secret>
AK_OFFICIAL_MODE=1
AK_TRUSTED_ISSUER_PUBLIC_KEY=<operator-public-key>
AK_BLACKBOX_SECRET=<server-secret>
AK_EVALUATOR_MODULE=/opt/agent-killer-private/evaluator.mjs
AK_EVALUATOR_SHA256=<sha256>
AK_AGENT_CONTAINER_IMAGE=<digest-pinned-image>
AK_EVALUATOR_CONTAINER_IMAGE=<digest-pinned-image>
```

Strict official execution should additionally provide pinned security profiles and the deployment's resource limits.

### Recommended production shape

```text
Internet
   │
   ▼
Reverse Proxy / TLS
   │
   ▼
API / Verifier
   │
   ├──────────────► Public read paths / cached leaderboard
   │
   ▼
Controlled execution queue
   │
   ▼
Dedicated worker host
   │
   ├── participant container
   │       └── no network / bounded resources
   │
   └── private evaluator container
   │       └── hidden oracle / trusted evidence
   │
   ▼
Signed receipt
   │
   ▼
Independent verification / leaderboard
```

Do not expose the Docker socket to participant workloads. Keep signing keys and private evaluator material off the public repository.

Full deployment guidance lives in [`docs/OFFICIAL_DEPLOYMENT.md`](docs/OFFICIAL_DEPLOYMENT.md).

---

## API Overview

The server exposes a small HTTP API for health, benchmark discovery, job submission, result access, submissions, verification, and the v0.7 trial surface.

| Endpoint family | Purpose | Typical policy |
|---|---|---|
| `/api/health` | Service health/capability status | Public-safe metadata |
| `/api/manifest` | Core task manifest | Read-only |
| `/api/jobs/*` | Job lifecycle | Authenticated / bounded |
| `/api/result/*` | Result retrieval | Authenticated / safe IDs |
| `/api/submissions` | Official submission intake/listing | POST authenticated; GET bounded/paginated |
| `/api/verify-submission/*` | Submission verification | Authenticated / safe IDs |
| `/api/v07/*` | v0.7 trial discovery/status | Read-only |
| `/api/leaderboard` | Leaderboard view | Cached/verified |
| `/api/blackbox` | Challenge commitment selection | Controlled |

Exact routes and request schemas are defined in `src/server.js` and the related modules.

---

## Repository Structure

```text
agent-killer/
├── adapters/                         # Agent adapter registry and launch definitions
├── benchmarks/
│   ├── manifest.json                 # 55 reference benchmark tasks
│   └── generated/                    # Signed/generated packs (runtime ignored)
├── public/                           # Local dashboard assets
├── security/                         # Security profiles/configuration
├── src/
│   ├── core.js                       # Task loading, workspaces, evaluation, artifacts
│   ├── runner.js                     # Agent execution, suites, leaderboards
│   ├── adversarial.js                # Adversarial scenario definitions
│   ├── challenge-pack.js             # Deterministic generated packs
│   ├── generated.js                  # Parametric generation + fingerprints
│   ├── blackbox.js                   # Sealed challenge commitments
│   ├── profiles.js                   # Agent DNA
│   ├── gauntlet.js                   # Gauntlet and Kill Chain flows
│   ├── human.js                      # Human trials
│   ├── receipts.js                   # Ed25519 receipts/evidence
│   ├── submissions.js                # Submission/replay/trust lifecycle
│   ├── resource-governance.js        # Execution concurrency/lifetime controls
│   ├── container.js                  # Container execution boundary
│   ├── evaluator-worker.js            # Private evaluator worker entry point
│   ├── sandbox.js / security.js      # Isolation and evidence helpers
│   ├── v07.js                        # Historical v0.7 benchmark edition contract
│   └── server.js                     # HTTP API + public deployment boundary
├── tests/                            # Core, security, review, API, and release tests
├── docs/                             # Methodology, deployment, threat model, authoring
├── SECURITY.md                       # Security model
├── CONTRIBUTING.md                   # Contribution workflow
├── CHANGELOG.md                      # Release history
└── LICENSE                            # MIT
```

---

## Configuration

Agent Killer is intentionally conservative by default. Important operator controls include:

| Variable | Purpose |
|---|---|
| `AK_PUBLIC` | Enable public HTTP behavior |
| `AK_API_TOKEN` | Public API bearer token |
| `AK_OFFICIAL_MODE` | Enable strict official execution |
| `AK_RUNTIME_ROOT` | Dedicated runtime state root |
| `AK_AGENT_CONTAINER_IMAGE` | Participant image in official mode |
| `AK_EVALUATOR_CONTAINER_IMAGE` | Evaluator image in official mode |
| `AK_EVALUATOR_MODULE` | Private evaluator module |
| `AK_EVALUATOR_SHA256` | Private evaluator integrity pin |
| `AK_TRUSTED_ISSUER_PUBLIC_KEY` | Official receipt trust root |
| `AK_BLACKBOX_SECRET` | Production Black Box secret |
| `AK_GENERATOR_TRUSTED_PUBLIC_KEY` | Official generated-pack trust root |
| `AK_MAX_JOB_LIFETIME_MS` | Parent wall-clock job budget |
| `AK_MAX_RESULT_ARTIFACT_FILES` | Execution artifact file quota |
| `AK_MAX_RESULT_ARTIFACT_BYTES` | Execution artifact byte quota |
| `AK_ARTIFACT_RETENTION_TTL_MS` | Execution artifact TTL |
| `AK_MAX_BLACKBOX_RECORDS` | Black Box artifact count quota |
| `AK_MAX_TRUSTED_RESULT_FILES` | Trusted-result count quota |
| `AK_MAX_TRUSTED_RESULT_BYTES` | Trusted-result byte quota |
| `AK_TRUSTED_RESULT_RETENTION_TTL_MS` | Trusted-result TTL |
| `AK_MAX_SUBMISSION_FILES` | Submission file quota |
| `AK_MAX_SUBMISSION_BYTES` | Submission byte quota |
| `AK_SUBMISSION_RETENTION_TTL_MS` | Submission TTL |
| `AK_MAX_REPLAY_FILES` | Replay marker file quota |
| `AK_MAX_REPLAY_BYTES` | Replay marker byte quota |
| `AK_REPLAY_RETENTION_TTL_MS` | Replay marker lifecycle policy |
| `AK_MAX_SUBMISSION_PAGE_SIZE` | Public submission page ceiling |
| `AK_SUBMISSION_CACHE_TTL_MS` | Verification/list cache lifetime |
| `AK_ARTIFACT_INDEX_RECONCILE_MS` | Artifact index reconciliation interval |
| `AK_MAX_CONNECTIONS` | HTTP server connection ceiling |

Read the implementation and release notes before changing security-sensitive values. Operator-controlled limits should be tuned deliberately, not maximized merely because the configuration permits larger numbers.

---

## Version History

### v0.7.15 — Replay Integrity & Public Submission Hardening

- Hard-capped official receipt lifetime at issuance **and verification**.
- Bound replay-marker retention to receipt validity, preventing a valid receipt from outliving its replay marker.
- Added bounded public submission pagination and verification caching.
- Added replay-claim compensation when submission persistence fails.
- Strengthened replay lifecycle testing.

### v0.7.14 — Submission & Replay Lifecycle

- Added TTL/file/byte governance for submissions and replay markers.
- Added indexed lifecycle management with reconciliation.
- Preserved separate lifecycle policies for authoritative evidence.

### v0.7.13 — Remote Execution Lifetime

- Added bounded parent job lifetime.
- Propagated remaining wall-clock budget to child executions.
- Added global/per-caller active job controls and queue governance.
- Fixed remote execution gate completion handling.

### v0.7.12 — Resource Lifecycle Hardening

- Replaced repeated full artifact scans with indexed lifecycle pruning.
- Added lifecycle governance for trusted-result records.
- Added startup/maintenance reconciliation.

### v0.7.11 — Artifact Resource Governance

- Added bounded result/Black Box artifact lifecycle policy.
- Added file-count and byte quotas for execution artifacts.
- Fixed workspace cleanup regression discovered during release testing.

### v0.7.10 — Filesystem Snapshot Flood Hardening

- Added total-entry, directory, symlink, hardlink, and byte limits.
- Switched hostile directory traversal to streaming iteration.
- Added regression tests for filesystem-entry floods.

### v0.7.6 — Evidence & Zero-Trust Hardening

- Removed participant-visible secret/canary material from adversarial workspaces.
- Moved official hidden/mutation evaluation behind a dedicated pinned evaluator boundary.
- Added deny-by-default participant environment handling.
- Hardened generated task validation and benchmark fingerprints.
- Clarified network configuration vs network evidence.

### v0.7.3 — Zero-Trust Clean Baseline

- Strengthened disposable container execution and fail-closed official requirements.
- Moved runtime state outside the repository.
- Improved independent snapshot-based patch-scope enforcement.

### v0.7.0 — The Agent Trial

- Added the 15-task v0.7 pressure edition.
- Introduced the Roselline Test, public v0.7 API, and long-horizon trial concepts.

### v0.6.1 — Trust Hardened

- Introduced independent filesystem snapshots, output/process limits, environment filtering, official submission verification, replay protection, deterministic generated variants, and hardened public API defaults.

Earlier releases are documented in [`CHANGELOG.md`](CHANGELOG.md).

---

## Roadmap

### Phase 1 — Public Open Source Foundation ✅

- [x] 55 reference benchmark tasks
- [x] v0.7 adversarial/pressure edition
- [x] deterministic generated tasks
- [x] Agent DNA
- [x] Gauntlet / Kill Chain / Black Box
- [x] cryptographic receipts
- [x] public submission verification
- [x] resource governance
- [x] security release gates

### Phase 2 — Community Benchmark Network

- [ ] Public challenge submission workflow with maintainer review
- [ ] Independent benchmark-pack signing service
- [ ] Public verifier nodes
- [ ] Reproducible official result bundles
- [ ] Community-contributed agent adapters
- [ ] Better benchmark visualization and result exploration

### Phase 3 — Agent Killer Standard

- [ ] Versioned public benchmark specification
- [ ] Cross-provider reproducibility protocol
- [ ] Independent third-party security review
- [ ] Interoperability tooling for external benchmark operators
- [ ] Formal result attestation profile

### Phase 4 — Global Arena

- [ ] Public verified leaderboard at meaningful scale
- [ ] Blind tournament scheduling
- [ ] Challenge rotation and anti-overfitting strategy
- [ ] Multi-operator verification
- [ ] Transparent benchmark governance

> The project should remain neutral. If OpenAI, Anthropic, Google, Qwen, open-source models, or a smaller independent model wins, the benchmark should publish that result rather than tuning the benchmark toward a preferred provider.

---

## Open Source and Contributing

Agent Killer is intentionally open source because benchmark credibility depends on inspection.

We welcome contributions to:

- benchmark tasks and realistic failure modes;
- adversarial scenarios;
- agent adapters;
- test quality and mutation operators;
- documentation and methodology;
- performance and storage lifecycle tooling;
- independent red-team findings.

### Development workflow

```bash
npm install
npm run verify
```

Before opening a pull request:

1. Explain the behavioral change.
2. Add regression coverage for security-sensitive behavior.
3. Keep benchmark/task versioning explicit.
4. Avoid introducing hidden trust assumptions.
5. Do not include secrets, runtime artifacts, private evaluator code, or generated local state.

See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## Security Disclosure

Do not turn an unpatched security vulnerability into a public issue before the maintainer has had a chance to assess it.

Please read [`SECURITY.md`](SECURITY.md) for the threat model, trust boundaries, deployment requirements, and disclosure expectations.

Useful security reports include:

```text
Attack surface
Preconditions
Reproduction steps
Observed behavior
Expected security invariant
Impact
Suggested mitigation
```

Agent Killer explicitly welcomes adversarial testing. A well-supported finding is a contribution to the benchmark's credibility.

---

## Known Limitations

### 1. Live Docker/kernel enforcement is environment-dependent

The release test environment used for source-level verification may not have a Docker daemon. Static configuration and fail-closed logic are testable without Docker; actual kernel enforcement is not.

### 2. Local mode is not the official blind benchmark

Because the evaluator is open in the repository, local mode should not be represented as a secret-oracle competition.

### 3. Benchmark scores are not general intelligence scores

Agent Killer measures behavior under this benchmark's task construction, scoring, and harness. Strong performance is evidence of performance in that environment, not a proof of general intelligence.

### 4. Historical v0.7 edition identity is retained

`v0.7.11` remains the benchmark edition identifier for the 15 pressure trials even though the software package is newer. This is intentional for reproducibility.

### 5. Production deployment remains an operational system

A secure benchmark service still needs TLS, secret management, isolated worker hosts, resource monitoring, backups, dependency/image updates, log redaction, and an operator-controlled private evaluator.

---

## License

MIT License. See [`LICENSE`](LICENSE).

---

## Final Position

Agent Killer is built around a simple idea:

> **A coding agent should not merely produce an answer. It should survive the trial and prove what happened.**

**Rosellines × Mikasa**  
**Agent Killer — The Agent Trial**
