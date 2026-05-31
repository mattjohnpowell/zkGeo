import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import path from 'node:path';
import { promisify } from 'node:util';
import { LOCATION_CELL_V0, createProofEnvelope } from '../src/index.js';

const execFileAsync = promisify(execFile);

test('validate-envelope CLI accepts valid envelopes', async () => {
  const envelopePath = await writeEnvelope({
    disclosureLevel: 'district',
    cellResolution: 7,
  });

  const { stdout } = await execFileAsync('node', [
    'src/cli/validate-envelope.js',
    envelopePath,
    '--max-disclosure-level',
    'district',
    '--max-cell-resolution',
    '7',
    '--now',
    '2026-05-31T10:05:00.000Z',
  ]);

  assert.match(stdout, /Valid zkGeo envelope/);
});

test('validate-envelope CLI rejects policy violations', async () => {
  const envelopePath = await writeEnvelope({
    disclosureLevel: 'meter',
    cellResolution: 9,
  });

  await assert.rejects(
    execFileAsync('node', [
      'src/cli/validate-envelope.js',
      envelopePath,
      '--max-disclosure-level',
      'district',
      '--max-cell-resolution',
      '7',
      '--now',
      '2026-05-31T10:05:00.000Z',
    ]),
    /Invalid zkGeo envelope/,
  );
});

async function writeEnvelope({ disclosureLevel, cellResolution }) {
  const directory = await mkdtemp(path.join(tmpdir(), 'zkgeo-'));
  const envelopePath = path.join(directory, 'envelope.json');
  const envelope = createProofEnvelope({
    type: LOCATION_CELL_V0,
    proofSystem: 'noir-ultra-honk',
    cell: '87194ad2bffffff',
    cellResolution,
    disclosureLevel,
    subject: 'npub1example',
    issuedAt: '2026-05-31T10:00:00.000Z',
    expiresAt: '2026-05-31T10:10:00.000Z',
    nonce: 'test-nonce',
    proof: 'proof-bytes',
  });

  await writeFile(envelopePath, `${JSON.stringify(envelope, null, 2)}\n`);
  return envelopePath;
}
