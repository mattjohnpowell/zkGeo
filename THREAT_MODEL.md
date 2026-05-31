# Threat Model

## What zkGeo Protects

zkGeo is intended to stop applications, relays, or other clients from receiving exact latitude/longitude coordinates when a coarse public cell is enough.

It also gives third parties a way to reject malformed or fabricated coarse-cell claims once production proof verification exists.

For decentralized dating, zkGeo is intended to reduce the amount of sensitive location data exposed during discovery. The safety baseline should assume a high-risk user, such as someone being targeted by persistent or predatory strangers.

## What zkGeo Does Not Protect

zkGeo does not hide the public cell. Anyone who sees the proof can learn the cell.

zkGeo does not prove that a phone sensor honestly measured the coordinates. A malicious prover can use any coordinates they know unless a separate trusted-location attestation scheme is added.

zkGeo does not stop long-term movement profiling if users repeatedly publish proofs for nearby cells over time. Short expiry windows reduce stale data but do not solve correlation.

zkGeo does not provide Sybil resistance. Identity, rate limits, reputation, or paid friction remain separate systems.

zkGeo does not make precise rendering safe. Meter-level or raw latitude/longitude disclosure can still expose a user to physical harm even when the value is user-consented.

## Main Risks

- **Cell leakage:** H3 cells can still be sensitive at high resolutions.
- **Replay:** A valid proof could be reused unless verifiers enforce nonce or expiry policy.
- **Witness theft:** If exact coordinates are logged before proving, ZK does not help.
- **Backend mismatch:** Different H3 implementations must produce identical cell IDs.
- **False confidence:** Envelope validation is not cryptographic proof verification.
- **Predatory discovery:** Repeated coarse claims can let an adversary narrow down a user's routine, home area, workplace, or current venue.
- **Granularity escalation:** Apps may pressure users into revealing more precise location than needed for the interaction.
- **Live presence leakage:** Real-time updates can be more dangerous than stale approximate location because they support interception.

## Initial Policy Recommendations

- Default to coarse rendering for dating-style discovery, usually city or district level.
- Treat H3 resolution 7 as a maximum precision starting point for dating discovery, not a default guarantee of safety.
- Offer explicit disclosure levels such as `city`, `district`, `cell`, `meter`, and `latlng`.
- Require deliberate consent before using `meter` or `latlng`, and avoid those modes for passive discovery.
- Do not expose live cells directly to other users unless the user has chosen that mode for that interaction.
- Keep proof validity windows short, usually 5-15 minutes.
- Bind every proof to a subject key and nonce.
- Do not log private coordinates, witnesses, or generated proof inputs.
- Treat trusted device attestation as a separate protocol layer.
