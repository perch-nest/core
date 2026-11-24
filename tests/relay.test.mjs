// The relay serves both projects: the Node.js relay (relay/node/server.mjs) answers as Perch's, Roost's and the
// Nest's relay at once, and carries each one's topics and nothing else. (The Worker, relay/src/index.js, is the same
// protocol; each project's own end-to-end tests run it under wrangler.)
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MqttClient } from '../protocol/mqtt.js';

const HERE = dirname(fileURLToPath(import.meta.url));
let proc, base, data, site;

test.before(async () => {
  data = mkdtempSync(join(tmpdir(), 'nest-relay-data-'));
  site = mkdtempSync(join(tmpdir(), 'nest-relay-site-'));
  writeFileSync(join(site, 'index.html'), '<!doctype html><title>site</title>');
  const port = 20000 + Math.floor(Math.random() * 30000);
  proc = spawn(process.execPath, [join(HERE, '../relay/node/server.mjs')], {
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', RELAY_DATA: data, SITE_DIR: site }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  base = `http://127.0.0.1:${port}`;
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${base}/v1/info`)).ok) break; } catch {}
    if (i > 100) throw new Error('the relay did not start');
    await new Promise(r => setTimeout(r, 100));
  }
});

test.after(async () => {
  const gone = new Promise(r => proc.once('exit', r));
  proc.kill();
  await Promise.race([gone, new Promise(r => setTimeout(r, 3000))]);
  for (const d of [data, site]) rmSync(d, { recursive: true, force: true, maxRetries: 5 });
});

test('it answers as each project\'s relay, unclaimed at first', async () => {
  const info = await (await fetch(`${base}/v1/info`)).json();
  assert.equal(info.perch, 'relay');
  assert.equal(info.roost, 'relay');
  assert.equal(info.nest, 'relay');
  assert.equal(info.claimed, false);
  assert.match(await (await fetch(`${base}/`)).text(), /<title>site<\/title>/, 'and it serves the website it was given');
});

test('its broker carries Perch\'s, Roost\'s and the Nest\'s topics, and refuses anything else', async () => {
  const url = `${base.replace('http', 'ws')}/v1/mqtt`;
  const a = new MqttClient(url);
  const b = new MqttClient(url);
  await a.connect();
  await b.connect();
  const got = [];
  b.onmessage = (topic, payload) => got.push([topic, new TextDecoder().decode(payload)]);
  for (const t of ['perch/v1/h/x', 'roost/v1/h/x', 'nest/v1/x']) await b.subscribe(t);
  await assert.rejects(b.subscribe('other/v1/x'), /refused/);
  for (const t of ['perch/v1/h/x', 'roost/v1/h/x', 'nest/v1/x']) a.publish(t, t);
  for (let i = 0; i < 100 && got.length < 3; i++) await new Promise(r => setTimeout(r, 20));
  assert.deepEqual(got.map(g => g[0]).sort(), ['nest/v1/x', 'perch/v1/h/x', 'roost/v1/h/x']);
  a.close();
  b.close();
});
