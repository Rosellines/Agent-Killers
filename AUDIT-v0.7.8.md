# Agent Killer v0.7.8 Release Audit

## Purpose
Close the filesystem snapshot resource-exhaustion finding identified after v0.7.7.

## Findings closed

- Snapshot limits now apply to total filesystem entries, regular files, directories, symlinks, and hardlinks.
- Every directory entry is counted before further processing.
- Directory traversal uses `fs.opendir()` async iteration rather than materializing an entire directory with `readdir()`, reducing single-directory metadata amplification.
- Symlink and hardlink populations have explicit independent caps.
- Cleanup remains bounded by the snapshot limits and falls through to recursive removal when snapshot inspection is rejected.

## Release posture

Snapshot limits are defensive availability controls for hostile workspaces. They do not constitute container/kernel isolation; official runtime isolation remains a separate fail-closed security boundary.
