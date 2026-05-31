# zkGeo Protocol Draft

Status: draft v0.

## Goal

zkGeo lets a prover publish a coarse location claim that can be checked by a verifier without exposing exact coordinates.

The first supported claim is:

```txt
I know a latitude and longitude inside this public H3 cell.
```

This deliberately reveals the H3 cell. It does not provide full location hiding; it removes exact coordinate disclosure while keeping the claim indexable.

The protocol is designed for applications where location disclosure can create personal safety risk, especially decentralized online dating. Implementations should make the rendered granularity explicit and user-controlled instead of silently choosing the most precise value available.

## Non-Goals

- Proving that GPS data came from a trusted device.
- Preventing a user from proving a location they learned from someone else.
- Hiding the public H3 cell from relays or clients.
- Ranking users by exact distance.
- Replacing Sybil resistance, identity verification, or abuse controls.

## Disclosure Levels

Applications should expose location at an explicit disclosure level. The level describes what the user agreed to render or publish, not the full precision of the private witness.

Suggested initial levels:

- `city`: city-scale or broad metro-area rendering.
- `district`: neighborhood, borough, or large H3-cell rendering.
- `cell`: the exact public H3 cell committed in the proof envelope.
- `meter`: approximate meter-level rendering derived from a more precise cell or app-side policy.
- `latlng`: raw latitude/longitude rendering.

For decentralized dating, `city` or `district` should be the default. `meter` and `latlng` are high-risk modes because they can enable stalking, coercion, or unwanted in-person approach. They should require deliberate user consent and should not be used for passive discovery.

The proof envelope binds the proof to the selected disclosure level so verifiers can reject a proof presented under a different rendering policy.

## Default Dating Discovery Policy

Passive dating discovery should use a conservative verifier policy:

```json
{
  "maxDisclosureLevel": "district",
  "maxCellResolution": 7,
  "maxValiditySeconds": 900
}
```

This policy is not a proof that discovery is safe. It is a minimum SDK default for rejecting obviously over-precise or stale envelopes. Applications still need anti-probing, rate limits, identifier-linkability controls, and mutual-consent rules before any precision escalation.

## Proof Envelope

A zkGeo proof is transported in a protocol envelope:

```json
{
  "type": "zkgeo.location.cell.v0",
  "proof_system": "noir-ultra-honk",
  "cell": "87194ad2bffffff",
  "cell_resolution": 7,
  "disclosure_level": "district",
  "subject": "npub1...",
  "issued_at": "2026-05-31T10:00:00.000Z",
  "expires_at": "2026-05-31T10:10:00.000Z",
  "nonce": "b64url-random-128-bit-value",
  "public_inputs": {
    "cell": "87194ad2bffffff",
    "cell_resolution": 7,
    "disclosure_level": "district",
    "subject": "npub1...",
    "issued_at": "2026-05-31T10:00:00.000Z",
    "expires_at": "2026-05-31T10:10:00.000Z",
    "nonce": "b64url-random-128-bit-value"
  },
  "proof": "base64url-proof-bytes"
}
```

The repeated `public_inputs` object exists so verifiers can pass canonical public inputs to the selected proof backend. Top-level fields exist for indexing and quick validation.

## Verification Rules

A verifier must:

1. Validate the envelope fields and supported `type`.
2. Reject unsupported disclosure levels.
3. Reject proofs above the verifier's maximum allowed disclosure level.
4. Reject cells above the verifier's maximum allowed H3 resolution.
5. Reject expired proofs.
6. Reject proofs with a validity window longer than the verifier policy allows.
7. Confirm top-level fields exactly match `public_inputs`.
8. Verify the proof bytes with the declared proof system and circuit verification key.
9. Apply replay policy for `nonce` if accepting proofs for authenticated actions.

For passive discovery use cases, expiry plus short windows may be enough. For write actions, nonce replay tracking is required.

## Circuit v0

Private witness:

- latitude, represented as scaled integer degrees
- longitude, represented as scaled integer degrees

Public inputs:

- H3 cell
- H3 resolution
- disclosure level
- subject
- issued_at
- expires_at
- nonce

Constraint:

```txt
h3(lat, lng, cell_resolution) == cell
```

The exact circuit backend is not fixed in this draft. Noir is the preferred first candidate because it keeps circuit code portable across proving systems.

## Canonical Encoding

Latitude and longitude are represented as signed integer microdegrees:

```txt
coordinate_e6 = round(decimal_degrees * 1_000_000)
```

Valid encoded ranges:

- latitude: `-90_000_000` to `90_000_000`
- longitude: `-180_000_000` to `180_000_000`

This keeps the private witness deterministic across SDKs while avoiding floating-point values inside circuits.

Timestamps in the envelope are canonical ISO-8601 UTC strings with millisecond precision, for example:

```txt
2026-05-31T10:00:00.000Z
```

Future circuit public inputs may convert timestamps to Unix milliseconds or seconds, but the transport envelope uses canonical ISO strings for readability and verifier policy checks.

## Sparkler Integration

Sparkler should treat zkGeo as an optional proof attached to a coarse location update.

The Sparkler location service can index `cell` and verify the proof before accepting or relaying the update. It should still expire active locations and avoid storing exact coordinates.

Dating integrations should not expose live cells directly to other users. They should render the least precise level that satisfies discovery, avoid exact distance sorting, and require mutual consent before showing more precise proximity.
