<<<<<<< HEAD
# AGENT KILLER v0.7.15 — THE AGENT TRIAL
=======
# ☠️ AGENT KILLER
## The Agent Trial — Where Coding Agents Come to Prove They Can Survive.

**Benchmark edition: v0.7.11**  
**Open source: MIT**  
**Built by Rosellines × Mikasa**
**Current release: v0.7.15**  
**Benchmark edition: v0.7.11**  
**Open source: MIT**  
**Built by Rosellines × Mikasa**
>>>>>>> bdcc2a1259924fa55baf5baf8d556e65e51825e3

> **Can you prove you are the best agent?**

Agent Killer is an evidence-first arena for coding agents and humans. v0.7 adds 15 executable pressure trials, including Nightmare Gauntlet, Cognitive Load, Unknown Unknown, Irreversible Decision, Budget Pressure, Cascading Failure, Deceptive Repository, Agent Starvation, Distraction Attack, Memory War, Cross-Repo War, Human Trap, Self-Correction, Death Match, and the **Roselline Test**.

### Run
```bash
npm install
npm run verify
npx agent-killer v07 list
npx agent-killer v07 self-test
npx agent-killer v07 suite mock
```

### Public trust
Public submissions are accepted only when signed by a configured trusted issuer. Local/self-attested results are explicitly not official. Official evaluator mode requires a private evaluator module and Linux network namespace isolation; otherwise execution is refused.

### v0.7 design
- **15 pressure trials** are executable and deterministic.
- Hidden/oracle checks run outside participant workspaces in official mode.
- Patch scope is enforced with independent filesystem snapshots.
- Receipts are Ed25519 signed and verified before official leaderboard acceptance.
- Model, provider, version, and harness identity are recorded.
- Adversarial, human, benchmark-integrity, and cost/latency dimensions are kept separable.

### Important limitation
The repository reference runner is not a cryptographic guarantee of an external vendor's honesty. For a public competition, deploy the official evaluator behind a private service and publish only verified receipts.

# ☠️ Agent Killer v0.6.1

### **THE AGENT TRIAL — Where Coding Agents Come to Prove They Can Survive.**

Agent Killer is an evidence-first benchmark arena for coding agents, human engineers, and model/version combinations. The public repository contains a transparent local/reference evaluator; trusted world leaderboard results require an operator-controlled private evaluator and trusted issuer.

> **Built by Rosellines × Mikasa**
>
> **Not a leaderboard of vibes. A system of proof.**

---

## Why v0.6 exists

Most coding benchmarks ask one question: **can the system produce a correct patch?** Agent Killer asks a harder question:

> **Can an agent reason, modify, test, recover, stay inside scope, resist hostile instructions, avoid leaking protected material, report honestly, and produce a result that another party can verify?**

v0.6 turns the benchmark into an arena with fifteen first-class capabilities:

1. **Agent DNA** — multidimensional behavioral profile, not just one score.
2. **Agent Gauntlet** — staged trial across discovery, build, break, repair, defense, and proof.
3. **Adversarial Reality Track** — prompt injection, scope creep, canaries, supply-chain traps, repository noise, permission boundaries.
4. **Evidence/Claim Reliability** — an observable honesty proxy based on verifiable execution evidence; it is not mind-reading.
5. **Mutation War** — mutants must be killed by tests; weak patches do not get a free pass.
6. **Model × Agent × Harness Matrix** — identity includes provider, model, version, and harness.
7. **Cryptographic Benchmark Passport** — Ed25519-signed receipts over canonical benchmark evidence.
8. **Human vs AI Trial** — humans use the same evaluation engine and can appear in a separate human lane.
9. **Quality / Speed / Cost Frontier** — quality is tracked beside runtime and optional estimated cost.
10. **Agent Roulette** — random challenge selection for repeatable public trials.
11. **Kill Chain** — a multi-stage survival test instead of isolated tasks.
12. **Challenge Generator** — deterministic generated packs with seed-based identities.
13. **Verified World Leaderboard** — provider/model/version-aware results with verification state.
14. **Public Submission API** — file-backed intake and verification endpoints with hardened defaults.
15. **Black Box Mode** — challenge commitment is published before the task identity is revealed.

---

## Quick start

```bash
npm install
npm run verify
npm start
```

Open `http://127.0.0.1:3947`.

Run the reference suite:

```bash
npm run self-test
```

Run a real agent:

```bash
node src/cli.js agents
node src/cli.js run codex AK-001
node src/cli.js suite codex
```

Run the arena:

```bash
node src/cli.js gauntlet codex
node src/cli.js killchain codex
node src/cli.js roulette codex
node src/cli.js blackbox
```

Generate a deterministic challenge pack:

```bash
node src/cli.js generate 50 rosellines-001
```

Create a cryptographic passport from a suite submission:

```bash
node src/cli.js keygen
node src/cli.js submit results/<suite>.json codex --provider openai --model gpt-x --version 2026-09-06
node src/cli.js verify-submission <submission-id>
```

---

## Trust model

Agent Killer deliberately separates **execution**, **evaluation**, and **verification**.

- The agent can edit the workspace.
- Protected evaluation material is outside the editable workspace.
- Local/reference hidden tests are intentionally inspectable in the open-source distribution.
- Official blind evaluation uses `AK_EVALUATOR_MODULE`, an operator-controlled private evaluator that is never shipped to participants.
- Patch scope is enforced from an independent filesystem snapshot; Git is evidence, not the source of truth.
- Output is bounded before persistence.
- Public mode is disabled by default.
- Internet-facing mode requires `AK_PUBLIC=1` and an `AK_API_TOKEN`.
- Self-attested receipts are useful for local reproducibility but cannot become official leaderboard entries.
- Official leaderboard entries require a receipt signed by the deployment’s trusted issuer public key.
- Strict official execution refuses to run without an OS network sandbox and private evaluator.

### Global scoring

Core correctness and adversarial survival are kept separate. `arenaScore = 70% core average + 30% adversarial pass rate` when both tracks exist; otherwise the available track is reported directly.

### Public mode

Do **not** bind the service publicly without authentication and an operator-controlled trust boundary. Public submission accepts **official receipts only**; client-supplied score claims are rejected.

```bash
set AK_PUBLIC=1
set AK_API_TOKEN=change-this-to-a-long-random-secret
npm start
```

Linux/macOS:

```bash
export AK_PUBLIC=1
export AK_API_TOKEN="change-this-to-a-long-random-secret"
npm start
```

The server defaults to `127.0.0.1`. Public binding is an opt-in deployment decision.

---

## Agent DNA

A suite becomes a behavioral profile:

```text
Reasoning          94
Implementation     96
Debugging          91
Architecture       88
Security           97
Tool Discipline    93
Recovery           95
Honesty            90
Context Efficiency 81
Autonomy           96

OVERALL            92.1
PROFILE            Elite / High Trust
```

The dimensions are derived from observable benchmark evidence, not hidden chain-of-thought.

---

## Black Box protocol

Black Box mode publishes a commitment before the selected challenge is revealed:

```text
commitment = SHA-256(canonical(seed + selected task id))
```

A production deployment can hold the selected task pack on a remote verifier so participants cannot choose a convenient challenge after seeing the commitment.

---

## Challenge generation

Generated packs are **deterministic**. The same seed produces the same task identities and source lineage.

Every generated task records a deterministic seed, source lineage, variant, generated index, and generator version. Generated variants add parameterized public cases rather than merely changing IDs. For a trusted leaderboard, the private oracle remains outside the participant distribution.

---

## Human Trial

Create a human workspace:

```bash
node src/cli.js human start AK-001
```

Solve the task manually, then:

```bash
node src/cli.js human grade <workspace-directory>
```

The same observable evaluator is used for the human lane.

---

## Leaderboard identity

A result is not identified by `agent` alone. Agent Killer records:

```text
Agent
Provider
Model
Model Version
Harness Version
Benchmark Pack
Task Pack
Runtime
Optional Cost
```

This prevents meaningless comparisons such as merging two model versions under one label.

---

## Repository layout

```text
agent-killer/
├── adapters/                 agent registry
├── benchmarks/               core and generated packs
├── public/                   dashboard
├── src/
│   ├── core.js               workspace + evaluator
│   ├── runner.js             execution + suites
│   ├── adversarial.js        adversarial scenarios
│   ├── challenge-pack.js     deterministic challenge generation
│   ├── blackbox.js           sealed challenge commitments
│   ├── profiles.js            Agent DNA
│   ├── gauntlet.js            gauntlet + kill chain
│   ├── human.js              human trial
│   ├── receipts.js           Ed25519 passport
│   ├── submissions.js        submission verification
│   └── server.js             hardened API/dashboard server
├── tests/                    regression and platform tests
├── SECURITY.md
└── README.md
```

---

## v0.6 philosophy

Agent Killer is intentionally not “the benchmark with the most questions.”

The long-term goal is a **verification layer for agent performance**:

```text
                  AGENT KILLER
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
   EXECUTION       EVALUATION     VERIFICATION
        │              │              │
        └──────────────┼──────────────┘
                       ↓
                SIGNED PASSPORT
                       ↓
               PUBLIC REPUTATION
```

A benchmark can be copied. A verification ecosystem is harder to replace.

---

## License

MIT

## The 15 v0.7 Trials

| ID | Trial | Pressure tested |
|---|---|---|
| AK-041 | Nightmare Gauntlet | long-horizon invariant preservation |
| AK-042 | Cognitive Load | signal extraction under noise |
| AK-043 | Unknown Unknown | ambiguity handling |
| AK-044 | Irreversible Decision Trap | destructive-action discipline |
| AK-045 | Budget Pressure | constrained optimization |
| AK-046 | Cascading Failure | dependency propagation and cycles |
| AK-047 | Deceptive Repository | trusted-source selection |
| AK-048 | Agent Starvation | fairness / scheduling |
| AK-049 | Distraction Attack | ambiguity-safe target selection |
| AK-050 | Memory War | durable decision retention |
| AK-051 | Cross-Repo War | producer/consumer compatibility |
| AK-052 | Human Trap | conflict detection instead of bluffing |
| AK-053 | Self-Correction | idempotent repair |
| AK-054 | Death Match | transparent quality comparison |
| AK-055 | Roselline Test | benchmark/report integrity |

The reference pack is intentionally open for local reproducibility. Official public competition should deploy a private evaluator/oracle and publish only verified signed receipts.
