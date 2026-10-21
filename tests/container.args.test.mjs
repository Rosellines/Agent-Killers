import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { buildCreateArgs, validateMounts, DEFAULT_LIMITS } from '../src/container.js';
import { dockerAgentArgs } from '../src/sandbox.js';

const VALUE_FLAGS = new Set(['--name', '--network', '--memory', '--memory-swap', '--cpus', '--pids-limit', '--ulimit', '--cap-drop', '--security-opt', '--ipc', '--pid', '--uts', '--tmpfs', '--user', '--mount']);

// First positional argument after the flags, the way `docker create` reads it.
function imageOf(args) {
  for (let i = 1; i < args.length; i++) {
    if (VALUE_FLAGS.has(args[i])) { i++; continue; }
    if (args[i].startsWith('--')) continue;
    return args[i];
  }
}

const base = {
  name: 'agent-killer-test',
  image: 'example.invalid/agent@sha256:' + 'a'.repeat(64),
  limits: DEFAULT_LIMITS,
  seccomp: '/etc/agent-killer/seccomp.json',
  apparmor: 'agent-killer',
  user: '10000:10000',
  workspaceSize: 256 * 1024 * 1024,
  extraMounts: [
    { source: '/opt/ak/evaluator-worker.js', target: '/evaluator-worker.mjs', readonly: true },
    { source: '/opt/ak/module.mjs', target: '/evaluator/module.mjs', readonly: true },
  ],
};

const args = buildCreateArgs(base);

// seccomp/apparmor/no-new-privileges must each be the value of --security-opt, not stray positionals
for (const opt of ['no-new-privileges:true', `seccomp=${base.seccomp}`, `apparmor=${base.apparmor}`]) {
  const i = args.indexOf(opt);
  assert.ok(i > 0 && args[i - 1] === '--security-opt', `${opt} must follow --security-opt`);
}
assert.equal(imageOf(args), base.image, 'first positional argument must be the image');
assert.deepEqual(args.slice(-3), [base.image, 'sleep', 'infinity']);

// Docker only accepts "" or host for --uts and "", host or container:<id> for --pid
assert.ok(!args.includes('--uts') && !args.includes('--pid'));
assert.equal(args[args.indexOf('--ipc') + 1], 'private');

// --mount takes key=value fields
const mounts = args.flatMap((a, i) => (args[i - 1] === '--mount' ? [a] : []));
assert.equal(mounts.length, 2);
for (const m of mounts) {
  for (const field of m.split(',')) assert.ok(/^[a-z-]+(=.+)?$/.test(field) || field.startsWith('/'), `bad --mount field: ${field}`);
  assert.ok(m.startsWith('type=bind,') && m.endsWith(',readonly'), m);
}

// mount paths that would break the comma-separated value are rejected
for (const bad of ['/a,b', '/a"b', '/a\nb']) {
  assert.throws(() => validateMounts([{ source: bad, target: '/x' }]));
  assert.throws(() => validateMounts([{ source: '/a', target: bad }]));
}

// the legacy helper must not use the invalid namespace modes either
const legacy = dockerAgentArgs({ image: 'img', command: 'node', args: ['test.js'] });
assert.ok(!legacy.includes('--uts') && !legacy.includes('--pid'));
assert.equal(imageOf(['run', ...legacy.slice(1)]), 'img');

// If a docker CLI is installed, let its own flag parser check the arguments. A dead socket means no daemon is needed:
// a parse error ("unknown flag", "invalid argument", "invalid field") is reported before the connection attempt.
const probe = spawnSync('docker', ['--version'], { encoding: 'utf8' });
if (probe.status === 0) {
  const r = spawnSync('docker', args, { encoding: 'utf8', env: { PATH: process.env.PATH, HOME: process.env.HOME, DOCKER_HOST: 'unix:///nonexistent-agent-killer.sock' } });
  assert.doesNotMatch(r.stderr, /unknown flag|invalid argument|invalid field|unknown shorthand/, r.stderr);
} else {
  console.log('docker CLI not found: skipped CLI parser check');
}
console.log('CONTAINER ARGS TESTS OK');
