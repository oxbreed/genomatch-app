#!/usr/bin/env node
/**
 * Start Expo Go on LAN and always print a QR first.
 * Directly invokes Expo's CLI (no npx prompt). Uses --offline so the
 * phone does not need an Expo account.
 */
const { execFileSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = '8081';

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

killPort(PORT);

const printQr = path.join(ROOT, 'scripts/print-expo-qr.cjs');
const ip = execFileSync(process.execPath, [printQr, '--ip-only'], {
  encoding: 'utf8',
  timeout: 5000,
  env: process.env,
}).trim();

if (!ip) {
  say('Could not find a Wi-Fi IPv4 address. Join the same Wi-Fi as your iPhone.');
  process.exit(1);
}

say('');
say(`LAN address: ${ip}`);
say('Scan the QR with the iPhone Camera app (Expo Go has no scanner on iOS).');
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

const expoCli = path.join(ROOT, 'node_modules/expo/bin/cli');
if (!fs.existsSync(expoCli)) {
  say(`Missing ${expoCli}. Run: npm install`);
  process.exit(1);
}

say('');
say('Starting Metro (anonymous, no Expo login)…');
say('');

const env = {
  ...process.env,
  CI: '0',
  EXPO_NO_TELEMETRY: '1',
  EXPO_NO_GIT_STATUS: '1',
  EXPO_OFFLINE: '1',
  EXPO_DEVTOOLS_LISTEN_ADDRESS: process.env.EXPO_DEVTOOLS_LISTEN_ADDRESS || '0.0.0.0',
  REACT_NATIVE_PACKAGER_HOSTNAME: ip,
  COLUMNS: process.env.COLUMNS || '120',
  LINES: process.env.LINES || '50',
};
delete env.EXPO_NO_QR_CODE;
delete env.EXPO_TOKEN;

const child = spawn(process.execPath, [expoCli, 'start', '--go', '--offline', '--port', PORT, '--clear'], {
  cwd: ROOT,
  env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
