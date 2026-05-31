import { readFile } from 'node:fs/promises';

const requiredFiles = [
  'docs/DECISIONS/0001-proving-stack.md',
  'packages/circuits/README.md',
  'packages/circuits/Nargo.toml',
  'packages/circuits/src/main.nr',
];

const requiredWarnings = [
  {
    file: 'packages/circuits/README.md',
    text: 'not production cryptography',
  },
  {
    file: 'packages/circuits/src/main.nr',
    text: 'not production location proof verification',
  },
  {
    file: 'docs/DECISIONS/0001-proving-stack.md',
    text: 'not as a final production commitment',
  },
];

for (const file of requiredFiles) {
  await readFile(file, 'utf8');
}

for (const { file, text } of requiredWarnings) {
  const content = await readFile(file, 'utf8');
  if (!content.includes(text)) {
    console.error(`${file} is missing required warning: ${text}`);
    process.exit(1);
  }
}

console.log('Circuit scaffold warnings present.');
