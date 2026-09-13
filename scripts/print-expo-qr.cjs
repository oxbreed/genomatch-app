#!/usr/bin/env node
/**
 * Print a scannable Expo Go QR for exp://<lan-ip>:8081 and write expo-qr.png.
 * Uses Expo's `toqr` encoder so the terminal QR matches what `expo start` would draw.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { toQR } = require('toqr');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.EXPO_PORT || '8081';
const PNG_PATH = path.join(ROOT, 'expo-qr.png');

function lanIp() {
  const fromEnv = (process.env.REACT_NATIVE_PACKAGER_HOSTNAME || '').trim();
  if (fromEnv) return fromEnv;

  const nets = os.networkInterfaces();
  const found = [];
  for (const [name, addrs] of Object.entries(nets)) {
    for (const n of addrs || []) {
      const family = n.family === 4 || n.family === 'IPv4';
      if (!family || n.internal) continue;
      found.push({ name, address: n.address });
    }
  }
  const prefer = found.find((x) => /^(en0|en1|eth0|wlan0)$/i.test(x.name));
  return (prefer || found[0] || {}).address || '';
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function writePng(file, modules, scale = 8, quiet = 4) {
  const extent = Math.sqrt(modules.byteLength) | 0;
  const inner = extent + quiet * 2;
  const width = inner * scale;
  const rows = [];
  for (let y = 0; y < width; y++) {
    const row = [0];
    const my = Math.floor(y / scale) - quiet;
    for (let x = 0; x < width; x++) {
      const mx = Math.floor(x / scale) - quiet;
      let dark = 0;
      if (mx >= 0 && my >= 0 && mx < extent && my < extent) {
        dark = modules[my * extent + mx] ? 0 : 255;
      } else {
        dark = 255;
      }
      row.push(dark);
    }
    rows.push(Buffer.from(row));
  }
  const compressed = zlib.deflateSync(Buffer.concat(rows));
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(width, 4);
  ihdr[8] = 8;
  ihdr[9] = 0;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(file, png);
}

function printHalfblock(modules) {
  const extent = Math.sqrt(modules.byteLength) | 0;
  const CHAR_00 = '\u2588';
  const CHAR_10 = '\u2584';
  const CHAR_01 = '\u2580';
  const CHAR_11 = ' ';
  let output = CHAR_10.repeat(extent + 2);
  for (let row = 0; row < extent; row += 2) {
    output += '\n' + CHAR_00;
    for (let col = 0; col < extent; col++) {
      const top = modules[row * extent + col];
      const bottom = row + 1 < extent ? modules[(row + 1) * extent + col] : 1;
      const value = (top << 1) | bottom;
      output += [CHAR_00, CHAR_01, CHAR_10, CHAR_11][value];
    }
    output += CHAR_00;
  }
  if (extent % 2 === 0) {
    output += '\n' + CHAR_01.repeat(extent + 2);
  }
  process.stdout.write(output + '\n');
}

const ip = (process.argv[2] || lanIp()).trim();
if (!ip) {
  console.error('No LAN IP. Connect Wi-Fi, then retry.');
  process.exit(1);
}

const url = `exp://${ip}:${PORT}`;
const modules = toQR(url);
printHalfblock(modules);
writePng(PNG_PATH, modules);

console.log('');
console.log(url);
console.log(`QR image: ${PNG_PATH}`);
console.log('iPhone: Camera app → Open in Expo Go. Same Wi-Fi as this computer.');
