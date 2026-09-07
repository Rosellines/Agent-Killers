# Agent Killer v0.7.15 Audit

## Scope
Replay lifetime integrity and public submission endpoint availability were hardened.

## Controls
- Official receipt lifetime has a hard maximum at issuance and verification.
- Replay markers persist while their referenced receipt remains valid and become prunable only after receipt expiry plus retention policy.
- Public submission listing is bounded by page size and served from a short-lived verification cache.
- Replay claim is compensated when submission persistence fails.

## Assurance limitation
Live Docker/kernel enforcement remains unverified in the audit environment.
