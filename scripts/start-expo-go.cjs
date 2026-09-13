#!/usr/bin/env node
/**
 * Starts Expo Go and answers the "Log in / Proceed anonymously" menu
 * (down-arrow + Enter) whenever it appears.
 */
const { spawn, execSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PROJECT_ID = '11f7d939-f2b9-4c0c-a1bf-bd7411c45ec6';
const signDir = path.join(os.homedir(), '.expo', 'codesigning', PROJECT_ID);

fs.rmSync(path.join(os.homedir(), '.expo', 'codesigning'), { recursive: true, force: true });
fs.mkdirSync(signDir, { recursive: true });
fs.rmSync(path.join(ROOT, '.expo'), { recursive: true, force: true });

function freePort(port) {
  try {
    const pids = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' }).trim();
    if (!pids) return;
    execSync(`kill ${pids.split('\n').join(' ')}`, { stdio: 'ignore' });
  } catch {
    // nothing listening
  }
}

freePort(8081);
freePort(8082);
try {
  execSync('sleep 1');
} catch {
  // ignore
}

const env = { ...process.env };
delete env.CI;
delete env.EXPO_NONINTERACTIVE;

const child = spawn(
  'npx',
  ['expo', 'start', '--go', '--clear', '--tunnel', '--port', '8081'],
  {
    cwd: ROOT,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  }
);

let lastAnswer = 0;

function maybeAnswerAnonymous(chunk) {
  const text = chunk.toString();
  if (!text.includes('Proceed anonymously') && !text.includes('unverified-app-expo-go')) {
    return;
  }
  const now = Date.now();
  if (now - lastAnswer < 800) return;
  lastAnswer = now;
  child.stdin.write('\x1b[B\n');
}

function forward(stream, chunk) {
  stream.write(chunk);
  maybeAnswerAnonymous(chunk);
}

child.stdout.on('data', (c) => forward(process.stdout, c));
child.stderr.on('data', (c) => forward(process.stderr, c));
process.stdin.on('data', (c) => child.stdin.write(c));
if (process.stdin.isTTY) {
  try {
    process.stdin.setRawMode(true);
  } catch {
    // ignore
  }
}
process.stdin.resume();

child.on('exit', (code) => {
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(false);
    } catch {
      // ignore
    }
  }
  process.exit(code ?? 0);
});
child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
