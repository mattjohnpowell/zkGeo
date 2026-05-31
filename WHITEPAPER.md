# zkGeo Whitepaper

Status: working draft v0.

## Abstract

zkGeo is a privacy-preserving location proof protocol for applications that need approximate geographic discovery without collecting or publishing exact user coordinates.

The first target use case is decentralized online dating. In that setting, exact or live location disclosure can create physical safety risks, especially for users who may be targeted by persistent or predatory strangers. zkGeo is designed to let a user prove that they are inside a public coarse geographic cell while keeping their exact latitude and longitude private.

The protocol does not claim to make location sharing safe by itself. It deliberately reveals some location information, and repeated coarse claims can still be correlated. zkGeo therefore treats disclosure granularity, expiry, replay policy, and application-level safety controls as part of the design rather than optional presentation details.

## Motivation

Online dating products often rely on location. Users want to discover people nearby, filter by rough distance, or know whether a potential match is in a realistic meeting area. Traditional systems usually solve this by sending precise latitude and longitude to a centralized backend. That backend may then compute rankings, distances, or map views.

For decentralized dating, this model is a poor fit. A relay, indexer, or hostile client should not need exact coordinates just to support rough discovery. Publishing exact coordinates also creates obvious physical safety risks. Even approximate live location can be sensitive when an adversary can query repeatedly, correlate updates, or combine location with profile data.

zkGeo starts from a narrower requirement:

```txt
Let a user prove a coarse location claim without revealing exact coordinates.
```

The first supported claim is:

```txt
I know a latitude and longitude inside this public H3 cell.
```

This claim is useful for rough discovery while avoiding raw coordinate disclosure. It is not full anonymity, and it is not a guarantee of physical safety.

## Design Goals

- Keep exact latitude and longitude out of application databases, relays, and peer-visible messages when a coarse claim is enough.
- Let verifiers reject malformed or fabricated coarse-cell claims once production proof verification exists.
- Make location disclosure granularity explicit, user-controlled, and enforceable by verifier policy.
- Support dating-safe defaults, where passive discovery uses city-level or district-level rendering rather than precise proximity.
- Keep the protocol implementation-agnostic so it can be used by Sparkler and other decentralized applications.
- State non-goals and residual risks clearly so zero-knowledge proofs are not presented as a complete safety solution.

## Non-Goals

- zkGeo does not hide the public cell revealed by a proof.
- zkGeo does not prove that GPS data came from a trusted phone sensor.
- zkGeo does not prevent a malicious prover from proving a location they learned from someone else.
- zkGeo does not prevent long-term movement profiling if users repeatedly publish linkable proofs.
- zkGeo does not replace identity, reputation, Sybil resistance, rate limits, moderation, or abuse controls.
- zkGeo does not make meter-level or raw latitude/longitude rendering safe.

## Threat Model

The primary adversary for the dating use case is not only a curious server. zkGeo assumes the application may include users who intentionally try to locate, follow, harass, coerce, or intercept other users.

Relevant adversaries include:

- Relays or indexers that should not receive exact coordinates.
- Clients that scrape or store visible location claims.
- Users who repeatedly query discovery results to infer movement patterns.
- Users who create many identities to bypass rate limits or visibility controls.
- Applications that may accidentally encourage users to reveal more precision than needed.

zkGeo protects against exact coordinate disclosure to parties that only receive the proof envelope. It does not protect against all inference. A public cell, especially at high precision, can still identify a small area. Repeated proofs can reveal home, work, routine travel, or live presence.

## Disclosure Levels

zkGeo uses explicit disclosure levels to describe what the user consented to render or publish. These levels are not the private witness precision. The witness may contain exact coordinates while the rendered claim remains coarse.

Initial disclosure levels:

- `city`: city-scale or broad metro-area rendering.
- `district`: neighborhood, borough, or large-cell rendering.
- `cell`: the exact public H3 cell committed in the proof envelope.
- `meter`: approximate meter-level rendering derived from a more precise cell or app policy.
- `latlng`: raw latitude/longitude rendering.

For decentralized dating, `city` or `district` should be the default for passive discovery. `meter` and `latlng` are high-risk modes and should require deliberate consent, clear context, and strong product safeguards. They should not be used merely to sort strangers by exact proximity.

Verifier policy should be able to reject proofs above an allowed disclosure level. For example, a dating relay may accept `city` and `district`, reject `meter` and `latlng`, and only allow more precise proofs inside a mutually consented interaction flow.

## Protocol Overview

A zkGeo proof envelope contains public metadata, canonical public inputs, proof bytes, and the selected proof system.

Public inputs:

- `cell`: public H3 cell identifier.
- `cell_resolution`: H3 resolution used by the proof.
- `disclosure_level`: location rendering tier the user consented to expose.
- `subject`: public identity key the proof is bound to.
- `issued_at`: proof creation timestamp.
- `expires_at`: proof expiry timestamp.
- `nonce`: replay-protection value.

Private witness:

- latitude, represented as a canonical scaled integer.
- longitude, represented as a canonical scaled integer.
- optional device or location attestation input, depending on future proving modes.

Core claim:

```txt
The prover knows a latitude and longitude inside the public H3 cell,
and the proof is bound to the stated subject, nonce, disclosure level,
and validity window.
```

The first circuit constraint is expected to be:

```txt
h3(lat, lng, cell_resolution) == cell
```

The exact circuit backend is not finalized. Noir is the preferred first candidate unless benchmarking or circuit complexity blocks it.

## Verification Flow

A verifier should:

1. Validate the envelope fields and supported proof type.
2. Reject unsupported disclosure levels.
3. Reject proofs above the verifier's maximum allowed disclosure level.
4. Reject expired proofs.
5. Reject proofs with a validity window longer than policy allows.
6. Confirm top-level fields exactly match `public_inputs`.
7. Verify proof bytes with the declared proof system and circuit verification key.
8. Apply nonce replay policy when accepting proofs for authenticated actions.

Envelope validation alone is not cryptographic verification. Until a production circuit and verifier are implemented, zkGeo must not be represented as production proof verification.

## Dating Safety Model

The dating use case needs stricter defaults than generic geospatial proof systems.

Recommended defaults:

- Passive discovery should render `city` or `district`, not precise distance.
- Live cells should not be directly exposed to other users.
- Exact distance sorting should be avoided because it encourages proximity probing.
- Higher precision should require mutual consent and should be scoped to a specific interaction.
- Proofs should have short validity windows, commonly 5-15 minutes.
- Subject identifiers should avoid unnecessary cross-context linkability where the application can support pairwise or rotating identifiers.
- Applications should rate-limit discovery queries and detect repeated probing patterns.
- Private coordinates, witnesses, and generated proof inputs should not be logged.

These controls are outside the zero-knowledge circuit, but they are part of the safety design. A technically valid proof can still be harmful if the application renders it too precisely or too frequently.

## Sparkler Integration

Sparkler can consume zkGeo as an optional proof attached to a coarse location update. The Sparkler location service can index the public cell and verify the proof before accepting or relaying the update.

Sparkler should still avoid storing exact coordinates. For dating-style flows, it should render the least precise level that satisfies discovery and require mutual consent before revealing more precise proximity.

## Open Design Questions

- Which H3 resolutions correspond to `city`, `district`, and `cell` across dense urban, suburban, and rural contexts?
- Should disclosure levels be fixed globally, app-configured, or jurisdiction-aware?
- How should subject identifiers be rotated or scoped to reduce long-term correlation?
- How should verification keys be distributed and versioned?
- Can H3 cell membership be implemented efficiently enough in the first Noir circuit?
- Is mobile proving acceptable, or is delegated proving required?
- What device attestation layer, if any, should be supported without overstating trust?

## Roadmap

The v0 repository currently defines the proof envelope, threat model, verifier behavior, and JavaScript envelope validation.

Next milestones:

- Decide the first proving stack.
- Define canonical integer encoding for latitude, longitude, and timestamps.
- Define H3 resolution policy for dating-safe defaults.
- Implement a minimal cell-membership circuit.
- Add proof generation and verifier CLIs.
- Benchmark desktop and mobile proving.
- Produce interop test vectors.
- Complete a security and dating-safety review before any v1 claim.

## Conclusion

zkGeo is a narrow privacy primitive for coarse location claims. Its value is not that it makes users invisible; it reduces unnecessary exact-coordinate disclosure while preserving enough public structure for decentralized discovery.

For online dating, that distinction matters. The protocol must be paired with conservative disclosure defaults, user-controlled granularity, short-lived proofs, replay controls, and application-level anti-abuse measures. The whitepaper, protocol, SDK, and threat model should continue to evolve together so safety constraints remain part of the technical design.
