#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { DATING_DISCOVERY_POLICY, validateProofEnvelope } from '../index.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.length === 0) {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

const file = args[0];
const options = {};

for (let index = 1; index < args.length; index += 1) {
  const arg = args[index];
  const value = args[index + 1];

  if (arg === '--dating-discovery') {
    Object.assign(options, DATING_DISCOVERY_POLICY);
    continue;
  }

  if (arg === '--max-disclosure-level') {
    options.maxDisclosureLevel = requireValue(arg, value);
    index += 1;
    continue;
  }

  if (arg === '--max-cell-resolution') {
    options.maxCellResolution = Number.parseInt(requireValue(arg, value), 10);
    index += 1;
    continue;
  }

  if (arg === '--max-validity-seconds') {
    options.maxValiditySeconds = Number.parseInt(requireValue(arg, value), 10);
    index += 1;
    continue;
  }

  if (arg === '--now') {
    options.now = new Date(requireValue(arg, value));
    index += 1;
    continue;
  }

  console.error(`Unknown argument: ${arg}`);
  printUsage();
  process.exit(1);
}

try {
  const envelope = JSON.parse(await readFile(file, 'utf8'));
  const result = validateProofEnvelope(envelope, options);

  if (!result.ok) {
    console.error(`Invalid zkGeo envelope: ${result.errors[0]}`);
    process.exit(1);
  }

  console.log('Valid zkGeo envelope.');
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

function requireValue(arg, value) {
  if (!value || value.startsWith('--')) {
    console.error(`Missing value for ${arg}.`);
    process.exit(1);
  }

  return value;
}

function printUsage() {
  console.log(`Usage: zkgeo-validate-envelope <envelope.json> [options]

Options:
  --dating-discovery              Apply conservative passive dating discovery policy
  --max-disclosure-level <level>   Highest disclosure level accepted by policy
  --max-cell-resolution <0-15>     Highest H3 resolution accepted by policy
  --max-validity-seconds <seconds> Longest accepted validity window
  --now <iso-timestamp>            Override current time for deterministic checks
`);
}
