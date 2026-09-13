#!/usr/bin/env node
/**
 * Start Expo Go on LAN and print a QR first.
 *
 * App Store Expo Go for SDK 57 requires the SAME Expo account in
 * Expo CLI (this Mac) and in the Expo Go app. --offline looks like
 * "CLI is logged out" and the phone rejects the project.
 * @see https://expo.dev/changelog/expo-go-57-login
 */
const { execFileSync, spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = '8081';
const expoCli = path.join(ROOT, 'node_modules/expo/bin/cli');

function say(msg) {
  process.stdout.write(`${msg}\n`);
}

say('GenoMatch Expo Go starter…');

function killPort(port) {
  try {
    const out = execFileSync('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'], {
      encoding: 'utf8',
      timeout: 4000,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    for (const pid of out.split(/\s+/).map((s) => s.trim()).filter(Boolean)) {
      say(`Stopping leftover process on ${port} (pid ${pid})`);
      try {
        process.kill(Number(pid), 'SIGKILL');
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* nothing listening */
  }
}

function whoami() {
  try {
    const out = execFileSync(process.execPath, [expoCli, 'whoami'], {
      encoding: 'utf8',
      timeout: 20000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const name = out.trim().split('\n').filter(Boolean).pop();
    if (!name || /not logged in/i.test(name)) return null;
    return name;
  } catch (err) {
    const text = `${err.stdout || ''}${err.stderr || ''}${err.message || ''}`;
    if (/not logged in/i.test(text)) return null;
    return null;
  }
}

killPort(PORT);

if (!fs.existsSync(expoCli)) {
  say(`Missing ${expoCli}. Run: npm install`);
  process.exit(1);
}

let account = whoami();
if (!account) {
  say('');
  say('Expo Go on iPhone (SDK 57) requires the same Expo account on this Mac and in the app.');
  say('Opening Expo login in your browser. Use oxbreed, or create a free account at expo.dev/signup');
  say('');
  const login = spawnSync(process.execPath, [expoCli, 'login'], {
    cwd: ROOT,
    stdio: 'inherit',
  });
  if (login.status !== 0) {
    say('Login did not finish. Run this, then start again:');
    say('  npx expo login');
    say('  npm run start:go');
    process.exit(1);
  }
  account = whoami();
}

if (!account) {
  say('Still not logged in to Expo CLI. Run: npx expo login');
  process.exit(1);
}

say('');
say(`Expo CLI is signed in as: ${account}`);
say(`On the iPhone: Expo Go (home) → person icon (top right) → log in as ${account}`);
say('Use the same expo.dev username/password. Then scan the QR.');
say('');

const printQr = path.join(ROOT, 'scripts/print-expo-qr.cjs');
let ip = '';
try {
  ip = execFileSync(process.execPath, [printQr, '--ip-only'], {
    encoding: 'utf8',
    timeout: 5000,
    env: process.env,
  }).trim();
} catch {
  ip = '';
}

if (!ip) {
  say('Could not find a Wi-Fi IPv4 address. Join the same Wi-Fi as your iPhone.');
  process.exit(1);
}

say(`LAN address: ${ip}`);
say(`Or Expo Go → Enter URL → exp://${ip}:${PORT}`);
say('');

execFileSync(process.execPath, [printQr, ip], {
  stdio: 'inherit',
  env: { ...process.env, REACT_NATIVE_PACKAGER_HOSTNAME: ip },
});

const png = path.join(ROOT, 'expo-qr.png');
if (process.platform === 'darwin' && fs.existsSync(png)) {
  try {
    spawn('open', ['-g', png], { stdio: 'ignore', detached: true }).unref();
  } catch {
    /* ignore */
  }
}

say('');
say('Starting Metro…');
say('');

const env = {
  ...process.env,
  CI: '0',
  EXPO_NO_TELEMETRY: '1',
  EXPO_NO_GIT_STATUS: '1',
  EXPO_DEVTOOLS_LISTEN_ADDRESS: process.env.EXPO_DEVTOOLS_LISTEN_ADDRESS || '0.0.0.0',
  REACT_NATIVE_PACKAGER_HOSTNAME: ip,
  COLUMNS: process.env.COLUMNS || '120',
  LINES: process.env.LINES || '50',
};
delete env.EXPO_NO_QR_CODE;
delete env.EXPO_OFFLINE;
delete env.CI;

env.CI = '0';

const child = spawn(process.execPath, [expoCli, 'start', '--go', '--port', PORT, '--clear'], {
  cwd: ROOT,
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
