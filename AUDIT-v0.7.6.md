# Agent Killer v0.7.6 Release Audit

Release-gate status: PASS

- npm test: PASS
- npm audit --omit=dev: 0 vulnerabilities
- validate: PASS
- self-test: 55/55
- v0.7 self-test: 15/15
- API smoke: PASS
- public API smoke: PASS
- dedicated v0.7.6 trust-hardening audit: PASS

Official live container execution requires a Linux host with Docker, a digest-pinned participant image, a digest-pinned evaluator image, pinned seccomp/AppArmor profiles, and private evaluator trust material.

This package contains no runtime submissions, generated pack artifacts, or private signing keys.
