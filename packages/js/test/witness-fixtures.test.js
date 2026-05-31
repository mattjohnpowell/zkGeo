import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MAX_LATITUDE_E6,
  MAX_LONGITUDE_E6,
  encodeCoordinateMagnitudeE6,
} from '../src/index.js';

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const WITNESS_DIR = path.resolve(TEST_DIR, '../../../fixtures/witnesses');

const witnessCases = [
  'coordinate-bounds-valid.json',
  'coordinate-bounds-invalid-latitude.json',
  'coordinate-bounds-invalid-longitude.json',
];

for (const file of witnessCases) {
  test(`coordinate witness fixture: ${file}`, async () => {
    const fixture = await readJson(path.join(WITNESS_DIR, file));
    const latAbs = encodeCoordinateMagnitudeE6(fixture.lat_e6, 'lat_e6');
    const lngAbs = encodeCoordinateMagnitudeE6(fixture.lng_e6, 'lng_e6');

    assert.equal(String(latAbs), fixture.noir_inputs.lat_abs_e6);
    assert.equal(String(lngAbs), fixture.noir_inputs.lng_abs_e6);

    const ok = latAbs <= MAX_LATITUDE_E6 && lngAbs <= MAX_LONGITUDE_E6;
    assert.equal(ok, fixture.expected.ok);
  });
}

test('rejects non-integer coordinate magnitudes', () => {
  assert.throws(() => encodeCoordinateMagnitudeE6(1.5), /integer/);
});

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'));
}
