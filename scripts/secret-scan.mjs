import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

const IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'coverage',
  '.cache',
  '.turbo',
]);

const IGNORED_FILES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
]);

const TEXT_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.env',
  '.example',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.njs',
  '.ts',
  '.tsx',
  '.toml',
  '.txt',
  '.yaml',
  '.yml',
]);

const SECRET_PATTERNS = [
  {
    name: 'private key block',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |)?PRIVATE KEY-----/,
  },
  {
    name: 'generic api key assignment',
    pattern: /\b(?:api[_-]?key|secret[_-]?key|client[_-]?secret|access[_-]?token|auth[_-]?token|private[_-]?key)\b\s*[:=]\s*["']?[A-Za-z0-9_./+=-]{20,}/i,
  },
  {
    name: 'aws access key id',
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
  },
  {
    name: 'github token',
    pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b|\bgh[pousr]_[A-Za-z0-9_]{30,}\b/,
  },
  {
    name: 'openai api key',
    pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/,
  },
  {
    name: 'seed phrase marker',
    pattern: /\b(?:seed phrase|mnemonic)\b\s*[:=]/i,
  },
];

const ALLOWLIST_PATTERNS = [
  /replace-with-/,
  /placeholder/i,
  /example/i,
  /b64url-random-128-bit-value/,
  /proof-bytes/,
];

const findings = [];

await scanDirectory(ROOT);

if (findings.length > 0) {
  console.error('Potential secrets found:');

  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} ${finding.name}`);
  }

  process.exit(1);
}

console.log('No obvious secrets found.');

async function scanDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        await scanDirectory(path.join(directory, entry.name));
      }

      continue;
    }

    if (!entry.isFile() || IGNORED_FILES.has(entry.name)) {
      continue;
    }

    const filePath = path.join(directory, entry.name);
    if (shouldScanFile(filePath)) {
      await scanFile(filePath);
    }
  }
}

function shouldScanFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(extension) || extension === '';
}

async function scanFile(filePath) {
  const content = await readFile(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (ALLOWLIST_PATTERNS.some((pattern) => pattern.test(line))) {
      return;
    }

    for (const { name, pattern } of SECRET_PATTERNS) {
      if (pattern.test(line)) {
        findings.push({
          file: path.relative(ROOT, filePath),
          line: index + 1,
          name,
        });
      }
    }
  });
}
