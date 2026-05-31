import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateProofEnvelope } from '../src/index.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(TEST_DIR, '../../../fixtures');
const manifest = await readJson(path.join(FIXTURES_DIR, 'test-vectors.json'));

for (const testCase of manifest.cases) {
  test(`fixture: ${testCase.name}`, async () => {
    const envelope = await readJson(path.join(FIXTURES_DIR, testCase.file));
    const result = validateProofEnvelope(envelope, {
      ...testCase.policy,
      now: new Date(manifest.now),
    });

    assert.equal(result.ok, testCase.ok);

    if (testCase.ok) {
      assert.deepEqual(result.errors, []);
    } else {
      assert.match(result.errors[0], new RegExp(escapeRegExp(testCase.error)));
    }
  });
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
