import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('exits 2 when host and key are missing', () => {
  const r = spawnSync('node', ['indexnow.mjs'], { encoding: 'utf8', env: { PATH: process.env.PATH } });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /--host and --key/);
});
