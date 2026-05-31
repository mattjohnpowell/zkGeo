import { verifyProofEnvelope } from '@zkgeo/protocol';

const issuedAt = new Date().toISOString();
const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
const nonce = 'replace-with-random-nonce';

const envelope = {
  type: 'zkgeo.location.cell.v0',
  proof_system: 'noir-ultra-honk',
  cell: '87194ad2bffffff',
  cell_resolution: 7,
  disclosure_level: 'district',
  subject: 'npub1example',
  issued_at: issuedAt,
  expires_at: expiresAt,
  nonce,
  public_inputs: {
    cell: '87194ad2bffffff',
    cell_resolution: 7,
    disclosure_level: 'district',
    subject: 'npub1example',
    issued_at: issuedAt,
    expires_at: expiresAt,
    nonce,
  },
  proof: 'replace-with-real-proof-bytes',
};

const result = await verifyProofEnvelope(
  envelope,
  async () => {
    throw new Error('Wire a real ZK proof verifier here.');
  },
  { maxDisclosureLevel: 'district' },
);

console.log(result);
