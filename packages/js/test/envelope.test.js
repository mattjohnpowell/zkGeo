import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  COORDINATE_SCALE,
  DATING_DISCOVERY_POLICY,
  DISCLOSURE_LEVELS,
  LOCATION_CELL_V0,
  canonicalizeTimestamp,
  createProofEnvelope,
  decodeCoordinateE6,
  encodeLatitude,
  encodeLongitude,
  validateProofEnvelope,
  validateDatingDiscoveryEnvelope,
  verifyDatingDiscoveryEnvelope,
  verifyProofEnvelope,
} from '../src/index.js';

const validEnvelope = {
  type: LOCATION_CELL_V0,
  proof_system: 'noir-ultra-honk',
  cell: '87194ad2bffffff',
  cell_resolution: 7,
  disclosure_level: 'district',
  subject: 'npub1example',
  issued_at: '2026-05-31T10:00:00.000Z',
  expires_at: '2026-05-31T10:10:00.000Z',
  nonce: 'test-nonce',
  public_inputs: {
    cell: '87194ad2bffffff',
    cell_resolution: 7,
    disclosure_level: 'district',
    subject: 'npub1example',
    issued_at: '2026-05-31T10:00:00.000Z',
    expires_at: '2026-05-31T10:10:00.000Z',
    nonce: 'test-nonce',
  },
  proof: 'proof-bytes',
};

test('accepts a valid proof envelope', () => {
  const result = validateProofEnvelope(validEnvelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('rejects an expired proof envelope', () => {
  const result = validateProofEnvelope(validEnvelope, {
    now: new Date('2026-05-31T10:11:00.000Z'),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /expired/);
});

test('rejects mismatched public inputs', () => {
  const envelope = structuredClone(validEnvelope);
  envelope.public_inputs.cell = '87194ad3bffffff';

  const result = validateProofEnvelope(envelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /public_inputs\.cell/);
});

test('exports disclosure levels ordered from least to most precise', () => {
  assert.deepEqual(DISCLOSURE_LEVELS, ['city', 'district', 'cell', 'meter', 'latlng']);
});

test('rejects unsupported disclosure levels', () => {
  const envelope = structuredClone(validEnvelope);
  envelope.disclosure_level = 'venue';
  envelope.public_inputs.disclosure_level = 'venue';

  const result = validateProofEnvelope(envelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /disclosure_level/);
});

test('rejects disclosure levels above verifier policy', () => {
  const envelope = structuredClone(validEnvelope);
  envelope.disclosure_level = 'meter';
  envelope.public_inputs.disclosure_level = 'meter';

  const result = validateProofEnvelope(envelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
    maxDisclosureLevel: 'district',
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /exceeds policy/);
});

test('exports conservative dating discovery policy defaults', () => {
  assert.deepEqual(DATING_DISCOVERY_POLICY, {
    maxDisclosureLevel: 'district',
    maxCellResolution: 7,
    maxValiditySeconds: 900,
  });
});

test('validates dating discovery envelopes with conservative defaults', () => {
  const result = validateDatingDiscoveryEnvelope(validEnvelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(result.ok, true);
});

test('rejects dating discovery envelopes above default precision policy', () => {
  const envelope = structuredClone(validEnvelope);
  envelope.disclosure_level = 'cell';
  envelope.public_inputs.disclosure_level = 'cell';

  const result = validateDatingDiscoveryEnvelope(envelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /disclosure_level exceeds policy/);
});

test('rejects cell resolutions above verifier policy', () => {
  const envelope = structuredClone(validEnvelope);
  envelope.cell_resolution = 9;
  envelope.public_inputs.cell_resolution = 9;

  const result = validateProofEnvelope(envelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
    maxCellResolution: 7,
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /cell_resolution exceeds policy/);
});

test('rejects non-base64url nonce and proof text', () => {
  const nonceEnvelope = structuredClone(validEnvelope);
  nonceEnvelope.nonce = 'bad nonce';
  nonceEnvelope.public_inputs.nonce = 'bad nonce';

  const nonceResult = validateProofEnvelope(nonceEnvelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(nonceResult.ok, false);
  assert.match(nonceResult.errors[0], /nonce/);

  const proofEnvelope = structuredClone(validEnvelope);
  proofEnvelope.proof = 'bad proof';

  const proofResult = validateProofEnvelope(proofEnvelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(proofResult.ok, false);
  assert.match(proofResult.errors[0], /proof/);
});

test('encodes coordinates as signed integer microdegrees', () => {
  assert.equal(COORDINATE_SCALE, 1_000_000);
  assert.equal(encodeLatitude(51.507351), 51_507_351);
  assert.equal(encodeLongitude(-0.127758), -127_758);
  assert.equal(decodeCoordinateE6(51_507_351), 51.507351);
});

test('rejects coordinates outside supported ranges', () => {
  assert.throws(() => encodeLatitude(90.000001), /outside/);
  assert.throws(() => encodeLatitude(-90.000001), /outside/);
  assert.throws(() => encodeLongitude(180.000001), /outside/);
  assert.throws(() => encodeLongitude(-180.000001), /outside/);
});

test('canonicalizes timestamps to ISO milliseconds', () => {
  assert.equal(canonicalizeTimestamp('2026-05-31T10:00:00Z'), '2026-05-31T10:00:00.000Z');
  assert.throws(() => canonicalizeTimestamp('not-a-date'), /timestamp/);
});

test('rejects too-long validity windows', () => {
  const envelope = structuredClone(validEnvelope);
  envelope.expires_at = '2026-05-31T11:00:00.000Z';
  envelope.public_inputs.expires_at = envelope.expires_at;

  const result = validateProofEnvelope(envelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /validity window/);
});

test('rejects non-canonical timestamp strings', () => {
  const envelope = structuredClone(validEnvelope);
  envelope.issued_at = '2026-05-31T10:00:00Z';
  envelope.public_inputs.issued_at = envelope.issued_at;

  const result = validateProofEnvelope(envelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /canonical ISO/);
});

test('creates envelopes with canonical mirrored public inputs', () => {
  const envelope = createProofEnvelope({
    proofSystem: 'noir-ultra-honk',
    cell: '87194ad2bffffff',
    cellResolution: 7,
    disclosureLevel: 'district',
    subject: 'npub1example',
    issuedAt: '2026-05-31T10:00:00Z',
    expiresAt: new Date('2026-05-31T10:10:00.000Z'),
    nonce: 'test-nonce',
    proof: 'proof-bytes',
  });

  assert.equal(envelope.issued_at, '2026-05-31T10:00:00.000Z');
  assert.equal(envelope.expires_at, '2026-05-31T10:10:00.000Z');
  assert.deepEqual(envelope.public_inputs, {
    cell: envelope.cell,
    cell_resolution: envelope.cell_resolution,
    disclosure_level: envelope.disclosure_level,
    subject: envelope.subject,
    issued_at: envelope.issued_at,
    expires_at: envelope.expires_at,
    nonce: envelope.nonce,
  });
});

test('created envelopes pass validation', () => {
  const envelope = createProofEnvelope({
    proof_system: 'noir-ultra-honk',
    cell: '87194ad2bffffff',
    cell_resolution: 7,
    disclosure_level: 'district',
    subject: 'npub1example',
    issued_at: '2026-05-31T10:00:00.000Z',
    expires_at: '2026-05-31T10:10:00.000Z',
    nonce: 'test-nonce',
    proof: 'proof-bytes',
  });

  const result = validateProofEnvelope(envelope, {
    now: new Date('2026-05-31T10:05:00.000Z'),
  });

  assert.equal(result.ok, true);
});

test('calls the injected proof verifier after envelope validation', async () => {
  const calls = [];
  const result = await verifyProofEnvelope(
    validEnvelope,
    async (input) => {
      calls.push(input);
      return true;
    },
    { now: new Date('2026-05-31T10:05:00.000Z') },
  );

  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].proofSystem, 'noir-ultra-honk');
});

test('rejects when injected proof verifier rejects', async () => {
  const result = await verifyProofEnvelope(
    validEnvelope,
    async () => false,
    { now: new Date('2026-05-31T10:05:00.000Z') },
  );

  assert.equal(result.ok, false);
  assert.match(result.errors[0], /rejected/);
});

test('verifies dating discovery envelopes with conservative defaults', async () => {
  const result = await verifyDatingDiscoveryEnvelope(
    validEnvelope,
    async () => true,
    { now: new Date('2026-05-31T10:05:00.000Z') },
  );

  assert.equal(result.ok, true);
});
