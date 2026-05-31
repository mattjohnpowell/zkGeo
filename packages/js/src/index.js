export const LOCATION_CELL_V0 = 'zkgeo.location.cell.v0';
export const DISCLOSURE_LEVELS = ['city', 'district', 'cell', 'meter', 'latlng'];
export const COORDINATE_SCALE = 1_000_000;
export const MIN_LATITUDE_E6 = -90 * COORDINATE_SCALE;
export const MAX_LATITUDE_E6 = 90 * COORDINATE_SCALE;
export const MIN_LONGITUDE_E6 = -180 * COORDINATE_SCALE;
export const MAX_LONGITUDE_E6 = 180 * COORDINATE_SCALE;

const REQUIRED_FIELDS = [
  'type',
  'proof_system',
  'cell',
  'cell_resolution',
  'disclosure_level',
  'subject',
  'issued_at',
  'expires_at',
  'nonce',
  'public_inputs',
  'proof',
];

const MIRRORED_PUBLIC_INPUTS = [
  'cell',
  'cell_resolution',
  'disclosure_level',
  'subject',
  'issued_at',
  'expires_at',
  'nonce',
];

export function validateProofEnvelope(envelope, options = {}) {
  const now = options.now ?? new Date();
  const maxValiditySeconds = options.maxValiditySeconds ?? 15 * 60;
  const maxDisclosureLevel = options.maxDisclosureLevel ?? 'latlng';
  const maxCellResolution = options.maxCellResolution ?? 15;
  const supportedTypes = options.supportedTypes ?? [LOCATION_CELL_V0];

  if (!isPlainObject(envelope)) {
    return invalid('Envelope must be an object.');
  }

  for (const field of REQUIRED_FIELDS) {
    if (!(field in envelope)) {
      return invalid(`Missing required field: ${field}.`);
    }
  }

  if (!supportedTypes.includes(envelope.type)) {
    return invalid(`Unsupported proof type: ${String(envelope.type)}.`);
  }

  if (!isNonEmptyString(envelope.proof_system)) {
    return invalid('proof_system must be a non-empty string.');
  }

  if (!isLikelyH3Cell(envelope.cell)) {
    return invalid('cell must be a lowercase hexadecimal H3 cell string.');
  }

  if (!Number.isInteger(envelope.cell_resolution) || envelope.cell_resolution < 0 || envelope.cell_resolution > 15) {
    return invalid('cell_resolution must be an integer from 0 to 15.');
  }

  if (!Number.isInteger(maxCellResolution) || maxCellResolution < 0 || maxCellResolution > 15) {
    return invalid('maxCellResolution must be an integer from 0 to 15.');
  }

  if (envelope.cell_resolution > maxCellResolution) {
    return invalid('cell_resolution exceeds policy.');
  }

  if (!DISCLOSURE_LEVELS.includes(envelope.disclosure_level)) {
    return invalid(`disclosure_level must be one of: ${DISCLOSURE_LEVELS.join(', ')}.`);
  }

  if (!DISCLOSURE_LEVELS.includes(maxDisclosureLevel)) {
    return invalid(`maxDisclosureLevel must be one of: ${DISCLOSURE_LEVELS.join(', ')}.`);
  }

  if (disclosureRank(envelope.disclosure_level) > disclosureRank(maxDisclosureLevel)) {
    return invalid('disclosure_level exceeds policy.');
  }

  if (!isNonEmptyString(envelope.subject)) {
    return invalid('subject must be a non-empty string.');
  }

  if (!isNonEmptyString(envelope.nonce)) {
    return invalid('nonce must be a non-empty string.');
  }

  if (!isBase64UrlString(envelope.nonce)) {
    return invalid('nonce must be base64url text.');
  }

  if (!isNonEmptyString(envelope.proof)) {
    return invalid('proof must be a non-empty string.');
  }

  if (!isBase64UrlString(envelope.proof)) {
    return invalid('proof must be base64url text.');
  }

  if (!isPlainObject(envelope.public_inputs)) {
    return invalid('public_inputs must be an object.');
  }

  for (const field of MIRRORED_PUBLIC_INPUTS) {
    if (envelope[field] !== envelope.public_inputs[field]) {
      return invalid(`public_inputs.${field} must match top-level ${field}.`);
    }
  }

  const issuedAt = parseIsoDate(envelope.issued_at);
  if (!issuedAt) {
    return invalid('issued_at must be a valid ISO timestamp.');
  }

  if (envelope.issued_at !== issuedAt.toISOString()) {
    return invalid('issued_at must use canonical ISO milliseconds.');
  }

  const expiresAt = parseIsoDate(envelope.expires_at);
  if (!expiresAt) {
    return invalid('expires_at must be a valid ISO timestamp.');
  }

  if (envelope.expires_at !== expiresAt.toISOString()) {
    return invalid('expires_at must use canonical ISO milliseconds.');
  }

  if (expiresAt <= issuedAt) {
    return invalid('expires_at must be after issued_at.');
  }

  const validitySeconds = (expiresAt.getTime() - issuedAt.getTime()) / 1000;
  if (validitySeconds > maxValiditySeconds) {
    return invalid('Proof validity window exceeds policy.');
  }

  if (expiresAt <= now) {
    return invalid('Proof has expired.');
  }

  return { ok: true, errors: [] };
}

export async function verifyProofEnvelope(envelope, verifier, options = {}) {
  const validation = validateProofEnvelope(envelope, options);
  if (!validation.ok) {
    return validation;
  }

  if (typeof verifier !== 'function') {
    return invalid('A proof verifier function is required.');
  }

  const verified = await verifier({
    proofSystem: envelope.proof_system,
    publicInputs: envelope.public_inputs,
    proof: envelope.proof,
  });

  return verified === true ? { ok: true, errors: [] } : invalid('Proof verifier rejected the proof.');
}

export function createProofEnvelope(input) {
  if (!isPlainObject(input)) {
    throw new TypeError('input must be an object.');
  }

  const issuedAt = canonicalizeTimestamp(input.issuedAt ?? input.issued_at);
  const expiresAt = canonicalizeTimestamp(input.expiresAt ?? input.expires_at);

  const envelope = {
    type: input.type ?? LOCATION_CELL_V0,
    proof_system: input.proofSystem ?? input.proof_system,
    cell: input.cell,
    cell_resolution: input.cellResolution ?? input.cell_resolution,
    disclosure_level: input.disclosureLevel ?? input.disclosure_level,
    subject: input.subject,
    issued_at: issuedAt,
    expires_at: expiresAt,
    nonce: input.nonce,
    public_inputs: {
      cell: input.cell,
      cell_resolution: input.cellResolution ?? input.cell_resolution,
      disclosure_level: input.disclosureLevel ?? input.disclosure_level,
      subject: input.subject,
      issued_at: issuedAt,
      expires_at: expiresAt,
      nonce: input.nonce,
    },
    proof: input.proof,
  };

  return envelope;
}

export function encodeLatitude(latitude) {
  return encodeCoordinate(latitude, MIN_LATITUDE_E6, MAX_LATITUDE_E6, 'latitude');
}

export function encodeLongitude(longitude) {
  return encodeCoordinate(longitude, MIN_LONGITUDE_E6, MAX_LONGITUDE_E6, 'longitude');
}

export function decodeCoordinateE6(coordinateE6) {
  if (!Number.isInteger(coordinateE6)) {
    throw new TypeError('coordinateE6 must be an integer.');
  }

  return coordinateE6 / COORDINATE_SCALE;
}

export function canonicalizeTimestamp(value) {
  const date = value instanceof Date ? value : parseIsoDate(value);
  if (!date || Number.isNaN(date.getTime())) {
    throw new TypeError('timestamp must be a valid ISO timestamp.');
  }

  return date.toISOString();
}

function invalid(message) {
  return { ok: false, errors: [message] };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

function isBase64UrlString(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_-]+$/.test(value);
}

function isLikelyH3Cell(value) {
  return typeof value === 'string' && /^[0-9a-f]{15}$/.test(value);
}

function parseIsoDate(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : new Date(timestamp);
}

function disclosureRank(level) {
  return DISCLOSURE_LEVELS.indexOf(level);
}

function encodeCoordinate(value, min, max, name) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }

  const encoded = Math.round(value * COORDINATE_SCALE);

  if (encoded < min || encoded > max) {
    throw new RangeError(`${name} is outside the supported range.`);
  }

  return encoded;
}
