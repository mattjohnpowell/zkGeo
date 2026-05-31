# Roadmap

## v0 Scaffold

- [x] Create standalone `zkGeo` repo.
- [x] Draft protocol envelope.
- [x] Draft whitepaper.
- [x] Draft threat model.
- [x] Add SDK envelope validation tests.
- [x] Document test requirements for security-sensitive changes.

## v0.1 Circuit Decision

- [x] Pick first proving stack candidate: Noir unless benchmarking blocks it.
- [x] Define disclosure levels: city, district, cell, meter, and latlng.
- [x] Define conservative passive dating discovery policy.
- [ ] Decide Sparkler-specific H3 indexing policy.
- [x] Add verifier policy checks for maximum allowed disclosure level.
- [x] Add verifier policy checks for maximum allowed H3 resolution.
- [x] Define canonical integer encoding for lat/lng and timestamps.
- [ ] Define verification key distribution and versioning.

## v0.2 Prototype Circuit

- [x] Add prototype circuit package scaffold.
- [ ] Implement a minimal absolute-coordinate-bounds circuit with runnable Noir tests.
- [ ] Implement a minimal cell-membership circuit.
- [ ] Add proof generation CLI.
- [x] Add envelope validation CLI.
- [ ] Add verifier CLI once production proof verification exists.
- [ ] Benchmark proving on desktop.

## v0.3 Mobile Feasibility

- [ ] Benchmark proof generation on low-end Android.
- [ ] Measure proof size and verification cost.
- [ ] Decide whether mobile proving is acceptable or needs delegated proving.

## v1 Candidate

- [ ] Security review of circuit and SDK.
- [ ] Dating safety review for granularity defaults, live-presence leakage, and escalation flows.
- [x] Initial envelope validation test vectors.
- [ ] Circuit and proof interop test vectors.
- [ ] Sparkler location service integration.
- [ ] Dart and TypeScript package publishing.
