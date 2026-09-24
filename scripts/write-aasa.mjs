#!/usr/bin/env node
/**
 * Writes website/public/.well-known/apple-app-site-association
 *
 * Set APPLE_TEAM_ID to your 10-character Apple Developer Team ID
 * (Apple Developer → Membership). Without it the file still deploys,
 * but iOS will not open Universal Links until the real Team ID is in place.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const teamId = (process.env.APPLE_TEAM_ID || '').trim();
const appId = `${teamId || 'REPLACE_APPLE_TEAM_ID'}.ng.genomatch.app`;

const payload = {
  applinks: {
    apps: [],
    details: [
      {
        appID: appId,
        paths: [
          '/reset-password',
          '/reset-password/*',
          '/privacy',
          '/privacy/*',
          '/terms',
          '/terms/*',
          '/support',
          '/support/*',
          '/guidelines',
          '/guidelines/*',
        ],
      },
    ],
  },
};

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, '..', 'website', 'public', '.well-known');
fs.mkdirSync(dir, { recursive: true });
const body = `${JSON.stringify(payload, null, 2)}\n`;
fs.writeFileSync(path.join(dir, 'apple-app-site-association'), body);
fs.writeFileSync(path.join(dir, 'apple-app-site-association.json'), body);
fs.writeFileSync(path.join(here, '..', 'website', 'public', 'apple-app-site-association'), body);

if (!teamId) {
  console.warn(
    '[aasa] APPLE_TEAM_ID is not set. Universal Links will not work until you set it and redeploy the site.'
  );
} else {
  console.log(`[aasa] wrote appID ${appId}`);
}
