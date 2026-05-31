# zkGeo

zkGeo is a privacy-preserving location proof protocol.

The first protocol target is simple: prove that a private latitude/longitude lies inside a public coarse geographic cell, without publishing the exact coordinates.

The initial product setting is decentralized online dating, where exact or live location disclosure can create physical safety risks. zkGeo should therefore treat user-selected disclosure granularity as a core protocol and SDK concern, not only an app UI choice.

This repo is intentionally separate from Sparkler. Sparkler can consume zkGeo later, but zkGeo should remain implementation-agnostic enough for other decentralized applications.

For the broader design rationale, see [WHITEPAPER.md](WHITEPAPER.md).

## Current Status

This is a v0 scaffold. It defines:

- the proof envelope shape
- the intended public and private inputs
- verifier behavior
- known limits and non-goals
- a small JavaScript SDK for envelope validation

It does not yet include a production ZK circuit.

## Protocol Sketch

Public inputs:

- `cell`: a coarse H3 cell identifier
- `cell_resolution`: the H3 resolution used by the proof
- `disclosure_level`: the location rendering tier the user consented to expose
- `subject`: the public identity key the proof is bound to
- `issued_at`: proof creation time
- `expires_at`: proof expiry time
- `nonce`: replay-protection value

Private inputs:

- exact latitude
- exact longitude
- optional device/location attestation input, depending on the proving mode

Claim:

```txt
The prover knows a latitude/longitude pair inside the public H3 cell,
and the proof is bound to the stated subject, nonce, and validity window.
```

Disclosure levels should be explicit. Dating-style discovery should default to city, district, or similarly coarse rendering. Meter-level or raw latitude/longitude rendering is a high-risk mode and should require deliberate user consent, strong contextual justification, and app-level safeguards.

## Repository Layout

```txt
SPEC.md             protocol draft
WHITEPAPER.md       design rationale and safety model
THREAT_MODEL.md     privacy, trust, and abuse notes
ROADMAP.md          next implementation steps
packages/js/        JavaScript protocol envelope SDK
examples/           minimal verifier wiring examples
```

## Development

Run tests:

```powershell
npm test
```

Scan for obvious committed secrets before pushing:

```powershell
npm run scan:secrets
```

Validate a proof envelope without performing cryptographic proof verification:

```powershell
node packages/js/src/cli/validate-envelope.js envelope.json --max-disclosure-level district --max-cell-resolution 7
```

## Naming

The project name is `zkGeo`. Package names should use `zkgeo` or `@zkgeo/*`.
