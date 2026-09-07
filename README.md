# ☠️ AGENT KILLER

## THE AGENT TRIAL

> **Where Coding Agents Come to Prove They Can Survive.**

[![Release](https://img.shields.io/badge/release-v0.7.16-black?style=for-the-badge&logo=github)](CHANGELOG.md)
[![Benchmark](https://img.shields.io/badge/benchmark-v0.7.11-ef4444?style=for-the-badge)](#benchmark-tracks)
[![Security](https://img.shields.io/badge/security-zero--trust--oriented-7c3aed?style=for-the-badge)](SECURITY.md)
[![License](https://img.shields.io/badge/license-MIT-111827?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/node-20%2B-339933?style=for-the-badge&logo=node.js)](package.json)

### Can you prove you are the best agent?

Agent Killer is an **evidence-first benchmark arena** for coding agents and human engineers.

It does not stop at:

```text
"Did the tests pass?"
```

It asks:

```text
Did the agent understand the repository?
Did it stay inside scope?
Did it survive hostile instructions?
Did it pass hidden checks?
Did its tests kill mutations?
Could the result be reproduced?
Can another party verify the evidence?
```

> **Correctness is the entrance fee.  
> Survival is the benchmark.  
> Evidence is the proof.**

**Built by Rosellines × Mikasa**

---

## ⚔️ At a Glance

| Dimension | What Agent Killer Tests |
|---|---|
| 🧠 **Engineering** | Repository understanding, implementation, debugging, architecture |
| 🛡️ **Security** | Prompt injection, deceptive artifacts, scope traps, protected material |
| 🧬 **Mutation** | Whether tests actually kill broken implementations |
| 🔁 **Reproducibility** | Whether observable outcomes survive a deterministic rerun |
| 🎯 **Scope Discipline** | Whether unrelated files and protected paths stay untouched |
| 🌐 **Network Safety** | Runtime network policy and execution evidence |
| 💸 **Efficiency** | Runtime and optional estimated cost |
| 🔐 **Trust** | Signed receipts, evidence digests, claimant proof, replay protection |
| ☠️ **Long Horizon** | Gauntlet, Kill Chain, Death Match and other multi-stage trials |

---

## 🏆 Why Agent Killer Exists

Modern coding agents can produce convincing patches extremely quickly.

That makes a simple benchmark based only on visible tests increasingly weak.

Agent Killer treats the agent as a **hostile participant** and the benchmark as a **chain of evidence**.

A strong result should answer:

> **What happened?**

And, more importantly:

> **How do we know?**

---

## 🔥 What Makes It Different

### 01 — Correctness is only one dimension

Visible tests are necessary, not sufficient.

Agent Killer combines visible evaluation, hidden checks, mutation testing, independent filesystem snapshots, deterministic reruns and security hygiene.

### 02 — Scope is measured independently of Git

Git is useful evidence, but it is not the sole security boundary.

Filesystem snapshots make it harder for an agent to hide unauthorized changes behind Git manipulation.

### 03 — Hidden evaluation is separated from participant execution

Official evaluation can use an operator-controlled private evaluator outside the public repository and a dedicated evaluator container for sensitive paths.

### 04 — Official results are cryptographically verifiable

The official submission path is built around:

```text
trusted issuer
      ↓
Ed25519 receipt
      ↓
result identity + score
      ↓
result/evidence digests
      ↓
claimant proof
      ↓
replay protection
      ↓
verified leaderboard
```

### 05 — Resource abuse is part of the threat model

The benchmark constrains not only correctness, but also:

```text
execution time
concurrency
queue depth
workspace size
snapshot entries
output volume
artifacts
trusted results
submissions
replay markers
```

### 06 — The benchmark can test itself

The **Roselline Test** exists to challenge the integrity of the benchmark itself.

Because a benchmark claiming to be trustworthy should be willing to be attacked.

---

## ☠️ Benchmark Tracks

| Track | Purpose | Primary Signal |
|---|---|---|
| **Core** | Real engineering correctness | Visible + hidden behavior |
| **Mutation** | Test strength | Mutation kill rate |
| **Adversarial** | Safety + instruction resistance | Scope / security / network evidence |
| **Gauntlet** | Long-horizon resilience | Survival across stages |
| **Kill Chain** | Cascading failure recovery | Multi-stage recovery |
| **Black Box** | Challenge secrecy | Commitment / reveal integrity |
| **Human** | Human baseline | Same observable evaluator |
| **Roselline Test** | Benchmark integrity | Trust / evaluator weaknesses |
| **Generated** | Parametric coverage | Seeded / fingerprinted variants |
| **Death Match** | Direct comparison | Same edition, different agents |

### Current benchmark

**55 reference tasks**

Including:

**15 v0.7 pressure trials — AK-041 through AK-055**

> `0.7.16` is the software release version.  
> `v0.7.11` remains the historical benchmark edition identifier for the existing v0.7 trial contract.

---

## 🧪 The Trial Loop

```text
┌─────────────┐
│  Challenge  │
└──────┬──────┘
       ↓
┌─────────────┐
│ Agent Run   │
└──────┬──────┘
       ↓
┌─────────────┐
│ Evidence    │
│ Collection  │
└──────┬──────┘
       ↓
┌─────────────┐
│ Evaluation  │
├─────────────┤
│ visible     │
│ hidden      │
│ mutation    │
│ scope       │
│ security    │
│ rerun       │
└──────┬──────┘
       ↓
┌─────────────┐
│ Verification│
└──────┬──────┘
       ↓
┌─────────────┐
│   Receipt   │
└──────┬──────┘
       ↓
┌─────────────┐
│ Leaderboard │
└─────────────┘
```

---

## 📊 How Scoring Works

For a core task, Agent Killer evaluates:

| Dimension | Meaning |
|---|---|
| **Correctness** | Visible and hidden checks |
| **Test Quality** | Mutation-killing performance |
| **Patch Quality** | Scope integrity and oracle integrity |
| **Security** | Protected-material hygiene and illegal artifacts |
| **Efficiency** | Bounded runtime signal |
| **Reproducibility** | Deterministic observable rerun agreement |

A core task is scored on a **100-point scale**.

At arena level:

```text
arenaScore
    =
70% core average
+
30% adversarial pass rate
```

The scoring contract is versioned. Benchmark edition and task-pack identity must therefore travel with the result.

---

## 🔐 Evidence > Claims

Agent Killer intentionally distinguishes:

```text
EXECUTION
    ↓
EVALUATION
    ↓
VERIFICATION
```

### Local / reference mode

The public repository contains a transparent reference evaluator for reproducibility, development and benchmark authoring.

It is **not a secret oracle**.

### Official mode

Official deployments use an operator-controlled private evaluator and fail closed when required controls are absent.

A self-attested result can be useful locally.

It is **not an official leaderboard proof**.

---

## 🛡️ Security Model

Agent Killer is designed around a hostile participant model.

Current controls include:

- deny-by-default participant environment handling
- independent filesystem snapshots
- snapshot entry/file/directory/symlink/hardlink/byte limits
- streaming snapshot traversal
- bounded stdout/stderr
- process timeout handling
- parent job wall-clock deadlines
- concurrency and queue governance
- result/trusted-result/submission/replay lifecycle governance
- bounded artifact storage
- signed generated challenges
- private evaluator requirements
- pinned images and evaluator integrity pins
- `--network none` plus runtime network evidence
- no Docker socket in participant containers
- dropped Linux capabilities
- `no-new-privileges`
- disposable workspaces
- fail-closed official execution

### What this project does NOT claim

Agent Killer does **not** claim that application code alone proves a universal hostile-code sandbox.

The real trust boundary still includes:

```text
production worker host
Linux kernel
container runtime
seccomp
AppArmor
image provenance
credentials
network controls
monitoring
deployment process
```

The source-level audit environment may not have a live Docker daemon. In that case, configuration and fail-closed behavior can be tested, but **live kernel enforcement and container-escape resistance are not claimed as independently verified**.

---

## 🚀 Installation

### Requirements

- Node.js **20+**
- Git
- Unix-like environment recommended for official execution
- Docker required for strict official participant/evaluator execution

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd agent-killer
npm install
npm run verify
```

A clean release verification should finish with:

```text
RELEASE VERIFY CLEAN PASS
```

---

## ⚡ Quick Start

### List tasks

```bash
npx agent-killer list
```

### List agents

```bash
npx agent-killer agents
```

### Run one task

```bash
npx agent-killer run mock AK-001
```

### Full 55-task reference self-test

```bash
npm run self-test
```

### v0.7 pressure edition

```bash
npx agent-killer v07 list
npx agent-killer v07 self-test
npx agent-killer v07 suite mock
```

### Start the local dashboard

```bash
npm start
```

Then open:

```text
http://127.0.0.1:3947
```

---

## 🤖 Run a Real Agent

Inspect installed adapters:

```bash
node src/cli.js agents
```

Run one:

```bash
node src/cli.js run <agent-id> AK-001
```

Example:

```bash
node src/cli.js run codex AK-001
```

Metadata:

```bash
node src/cli.js run codex AK-001   --provider openai   --model <model-name>   --version <model-version>
```

For local debugging only:

```bash
node src/cli.js run codex AK-001 --keep
```

Remote/public execution does not trust arbitrary client retention settings; official server governance applies its own lifecycle policy.

---

## 🎲 The Arena

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

### Provider / model matrix

```bash
npm run matrix
```

---

## 🕳️ Black Box + Generated Challenges

### Black Box

Production Black Box mode can create a server-controlled commitment before challenge reveal.

This makes post-hoc task selection detectable.

### Deterministic generation

```bash
npx agent-killer generate 50 rosellines-001
```

Generated packs preserve:

```text
seed
source lineage
generator version
parameters
variant identity
fingerprints
```

Official authenticity depends on an operator-configured trusted generator public key.

---

## 👤 Human Trial

Start:

```bash
node src/cli.js human start AK-001
```

Grade:

```bash
node src/cli.js human grade <workspace-directory>
```

Human and agent lanes use the same observable evaluation concepts to keep the comparison meaningful.

---

## 🔏 Cryptographic Receipts

Create local signing material:

```bash
node src/cli.js keygen
```

Create a local submission:

```bash
node src/cli.js submit results/<suite>.json <agent-id>   --provider openai   --model <model-name>   --version <model-version>
```

Verify a receipt:

```bash
node src/cli.js verify-receipt <receipt-file>
```

Verify a stored submission:

```bash
node src/cli.js verify-submission <submission-id>
```

Official verification requires:

```text
trusted issuer
+ valid signature
+ valid receipt lifetime
+ matching result/evidence digests
+ trusted result verification
+ claimant proof
+ replay protection
```

---

## 🌐 Public / Official Deployment

Public mode is an operator deployment feature.

A minimal deployment needs:

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

Strict official execution should also use pinned security profiles and deliberate resource limits.

### Recommended shape

```text
Internet
   │
   ▼
Reverse Proxy / TLS
   │
   ▼
API / Verifier
   │
   ├──────► Public read paths / cached leaderboard
   │
   ▼
Controlled execution queue
   │
   ▼
Dedicated worker host
   │
   ├── participant container
   │      └── bounded + no network
   │
   └── private evaluator container
          └── hidden oracle + trusted evidence
   │
   ▼
Signed receipt
   │
   ▼
Independent verification
   │
   ▼
Leaderboard
```

> **Never expose the Docker socket to participant workloads.**
>
> Keep signing keys and private evaluator material outside the public repository.

---

## 🔌 API Overview

| Endpoint | Purpose |
|---|---|
| `/api/health` | Service health / capability status |
| `/api/manifest` | Core benchmark manifest |
| `/api/jobs/*` | Job lifecycle |
| `/api/result/*` | Result retrieval |
| `/api/submissions` | Official submission intake/listing |
| `/api/verify-submission/*` | Submission verification |
| `/api/v07/*` | v0.7 trial surface |
| `/api/leaderboard` | Verified leaderboard view |
| `/api/blackbox` | Controlled challenge commitments |

Exact schemas live in `src/server.js` and related modules.

---

## 🧬 Core Architecture

```text
src/
├── core.js                  Task loading, workspaces, evaluation
├── runner.js                Execution, suites, leaderboard logic
├── adversarial.js           Adversarial scenarios
├── challenge-pack.js        Generated challenge packs
├── generated.js             Generation + fingerprints
├── blackbox.js              Sealed challenge commitments
├── profiles.js              Agent DNA
├── gauntlet.js              Gauntlet / Kill Chain
├── human.js                 Human trials
├── receipts.js               Ed25519 receipts / evidence
├── submissions.js            Submission / replay lifecycle
├── resource-governance.js   Resource / retention controls
├── container.js             Container boundary
├── evaluator-worker.js      Private evaluator worker
├── sandbox.js               Isolation helpers
├── security.js              Security helpers
├── v07.js                   Historical v0.7 contract
└── server.js                HTTP / public deployment boundary
```

---

## ⚙️ Configuration

Important operator controls include:

| Variable | Purpose |
|---|---|
| `AK_PUBLIC` | Enable public HTTP behavior |
| `AK_API_TOKEN` | Public API bearer token |
| `AK_OFFICIAL_MODE` | Enable strict official execution |
| `AK_RUNTIME_ROOT` | Dedicated runtime state root |
| `AK_AGENT_CONTAINER_IMAGE` | Participant image |
| `AK_EVALUATOR_CONTAINER_IMAGE` | Evaluator image |
| `AK_EVALUATOR_MODULE` | Private evaluator module |
| `AK_EVALUATOR_SHA256` | Evaluator integrity pin |
| `AK_TRUSTED_ISSUER_PUBLIC_KEY` | Official receipt trust root |
| `AK_BLACKBOX_SECRET` | Black Box production secret |
| `AK_GENERATOR_TRUSTED_PUBLIC_KEY` | Generated-pack trust root |
| `AK_MAX_JOB_LIFETIME_MS` | Parent wall-clock budget |
| `AK_MAX_RESULT_ARTIFACT_FILES` | Artifact file quota |
| `AK_MAX_RESULT_ARTIFACT_BYTES` | Artifact byte quota |
| `AK_ARTIFACT_RETENTION_TTL_MS` | Artifact retention TTL |
| `AK_MAX_TRUSTED_RESULT_FILES` | Trusted-result quota |
| `AK_MAX_TRUSTED_RESULT_BYTES` | Trusted-result byte quota |
| `AK_TRUSTED_RESULT_RETENTION_TTL_MS` | Trusted-result TTL |
| `AK_MAX_SUBMISSION_FILES` | Submission file quota |
| `AK_MAX_SUBMISSION_BYTES` | Submission byte quota |
| `AK_SUBMISSION_RETENTION_TTL_MS` | Submission TTL |
| `AK_MAX_REPLAY_FILES` | Replay marker quota |
| `AK_MAX_REPLAY_BYTES` | Replay marker byte quota |
| `AK_REPLAY_RETENTION_TTL_MS` | Replay marker lifecycle |
| `AK_MAX_CONNECTIONS` | HTTP connection ceiling |

> Tune operator-controlled limits deliberately. Bigger is not automatically safer.

---

## 🗺️ Roadmap

### Phase 1 — Open Source Foundation ✅

- [x] 55 reference tasks
- [x] v0.7 pressure edition
- [x] deterministic generated tasks
- [x] Agent DNA
- [x] Gauntlet / Kill Chain / Black Box
- [x] cryptographic receipts
- [x] public submission verification
- [x] resource governance
- [x] security release gates

### Phase 2 — Community Benchmark Network

- [ ] Public challenge submission workflow
- [ ] Independent benchmark-pack signing service
- [ ] Public verifier nodes
- [ ] Reproducible official result bundles
- [ ] Community agent adapters
- [ ] Better benchmark visualization

### Phase 3 — Agent Killer Standard

- [ ] Versioned public benchmark specification
- [ ] Cross-provider reproducibility protocol
- [ ] Independent third-party security review
- [ ] External benchmark interoperability
- [ ] Formal attestation profile

### Phase 4 — Global Arena

- [ ] Public verified leaderboard at meaningful scale
- [ ] Blind tournament scheduling
- [ ] Challenge rotation / anti-overfitting
- [ ] Multi-operator verification
- [ ] Transparent benchmark governance

> **The benchmark remains neutral.**
>
> If OpenAI, Anthropic, Google, Qwen, an open-source model, or a smaller independent model wins, the result should be published—not tuned away.

---

## 🤝 Open Source & Contributing

Agent Killer is open source because benchmark credibility depends on inspection.

Contributions are welcome across:

- benchmark tasks
- adversarial scenarios
- agent adapters
- mutation operators
- methodology
- lifecycle tooling
- documentation
- independent red-team findings

Before opening a PR:

```bash
npm install
npm run verify
```

Security-sensitive changes should include regression tests and explicit versioning.

---

## 🚨 Security Disclosure

Please read [`SECURITY.md`](SECURITY.md) before publishing a potentially exploitable vulnerability.

Useful reports should include:

```text
Attack surface
Preconditions
Reproduction steps
Observed behavior
Expected security invariant
Impact
Suggested mitigation
```

> **A good adversarial finding makes Agent Killer stronger.**

---

## ⚠️ Known Limitations

### 1. Live Docker / kernel enforcement is environment-dependent

Source-level security configuration and fail-closed behavior can be tested without Docker.

Actual kernel enforcement cannot.

### 2. Local mode is not the official blind benchmark

The public evaluator is intentionally transparent.

### 3. Benchmark score ≠ general intelligence

Agent Killer measures behavior on this benchmark's tasks, scoring and harness.

### 4. Historical benchmark edition is retained

`v0.7.11` remains the historical v0.7 pressure-edition identity for reproducibility.

### 5. Production security remains operational

A real deployment still requires TLS, secret management, isolated worker hosts, monitoring, backups, dependency/image updates and an operator-controlled private evaluator.

---

## 📜 Version History

### v0.7.16 — Receipt Lifetime Integrity Fix

- Fixed receipt issuance/expiry boundary calculations to derive expiry from the same issuance timestamp.
- Preserved the official receipt lifetime ceiling without millisecond drift.
- Extended regression coverage for receipt lifetime and replay lifecycle behavior.

### v0.7.15 — Replay Integrity & Public Submission Hardening

- Hard-capped official receipt lifetime at issuance and verification.
- Bound replay-marker retention to receipt validity.
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

### v0.7.12 — Resource Lifecycle Hardening

- Replaced repeated full artifact scans with indexed lifecycle pruning.
- Added lifecycle governance for trusted-result records.
- Added startup/maintenance reconciliation.

### v0.7.11 — Artifact Resource Governance

- Added bounded result / Black Box artifact lifecycle policy.
- Added artifact file-count and byte quotas.
- Fixed workspace cleanup regressions.

### v0.7.10 — Filesystem Snapshot Flood Hardening

- Added total-entry, directory, symlink, hardlink and byte limits.
- Switched hostile directory traversal to streaming iteration.
- Added filesystem-entry flood regression coverage.

### v0.7.6 — Evidence & Zero-Trust Hardening

- Removed participant-visible secret/canary material from adversarial workspaces.
- Moved official hidden/mutation evaluation behind a dedicated pinned evaluator boundary.
- Added deny-by-default participant environment handling.
- Hardened generated task validation and benchmark fingerprints.
- Clarified network configuration vs network evidence.

### v0.7.3 — Zero-Trust Clean Baseline

- Strengthened disposable container execution.
- Moved runtime state outside the repository.
- Improved snapshot-based patch-scope enforcement.

### v0.7.0 — The Agent Trial

- Added 15-task v0.7 pressure edition.
- Introduced the Roselline Test and public v0.7 API.

---

## 🖤 Final Position

> **A coding agent should not merely produce an answer.  
> It should survive the trial—and prove what happened.**

### ☠️ AGENT KILLER

**THE AGENT TRIAL**

**Built by Rosellines × Mikasa**

---

### Neutral benchmark. Hostile tasks. Verifiable evidence.

