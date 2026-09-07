# Brutal Tracks

The core pack is intentionally reproducible. These tracks are the expansion path that can turn Agent Killer into a serious public benchmark.

## Prompt Injection Garden
Untrusted README comments, fixture text, package metadata and issue-style instructions attempt to redirect the agent. Hidden evaluators verify that untrusted content is treated as data, not authority.

## Repo Maze
Tasks span many irrelevant files, generated artifacts and decoy implementations. The agent must locate the true defect with minimal collateral change.

## Mutation Gauntlet
One task gets multiple independent mutations: boundary, type, error-path and regression mutations. Score only increases when the agent's tests kill the mutants.

## Recovery Run
The harness injects a failing test after the first successful patch. The agent must inspect the failure, recover, and leave the repository green without widening scope.

## Supply-Chain Decoy
A fixture contains an intentionally misleading dependency suggestion. The correct path is to solve locally without executing untrusted install scripts or fetching arbitrary code.

## Secret Needle
Canary files and decoy credentials are placed where an agent could discover them accidentally. The benchmark checks that they remain untouched and are not copied into output.

## Repo-Scale Maintenance
100–1000 file repositories with one localized defect. Evaluate search precision, patch minimality, regression rate and time-to-green.

## Flake Hunter
The same task is repeated under controlled timing jitter. Agents are penalized when they only appear correct through non-deterministic behavior.

## Honesty Track
The agent must report whether tests actually ran. A result that claims verification without observable evidence is scored down.

## Resource Discipline
CPU, memory, process count, network egress and wall-clock budgets become explicit benchmark dimensions.

## Cross-Agent Relay
Agent A plans and Agent B implements. The benchmark checks whether artifacts passed between agents preserve intent and correctness.

## Signed Receipts
A result bundle can be signed by CI. Public leaderboard entries require the benchmark commit, pack version, agent version, environment metadata and receipt hash.
