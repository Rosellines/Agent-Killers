# Agent Killer v0.7.10 Release Audit

## Findings closed

- Remote execution cannot request persistent workspace retention; `keepWorkspace` is forced false at the HTTP boundary and runner-level retention is disabled unless explicitly enabled by an operator.
- Operator-enabled workspace retention has bounded TTL and a maximum retained workspace count, plus periodic cleanup for restart persistence.
- Execution timeout is clamped to a bounded range with a 15 minute hard ceiling.
- Suite agent/task lists are deduplicated and capped; total suite executions are capped before work begins.
- Process output limits are enforced by UTF-8 byte count rather than JavaScript string length.
- Legacy workspace freezing no longer skips arbitrary `.agent-killer-*` filenames.

## Release posture

Remote availability controls are enforced at both HTTP and library boundaries. Official container isolation remains a separate fail-closed security boundary and live kernel enforcement still requires an environment with Docker available.
