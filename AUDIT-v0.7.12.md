# Agent Killer v0.7.12 Audit

## Release gate

- Result artifact pruning uses an in-memory lifecycle index and periodic reconciliation rather than an O(N) directory/stat scan on every write.
- Blackbox and ordinary result artifacts remain bounded by TTL/count/byte policy.
- Trusted result records now have operator-configurable TTL/file/byte lifecycle governance with serialized writes/pruning.
- Live Docker/kernel enforcement remains unverified in this environment.
