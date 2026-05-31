# Roadmap

## v0 Scaffold

- [x] Create standalone `zkGeo` repo.
- [x] Draft protocol envelope.
- [x] Draft whitepaper.
- [x] Draft threat model.
- [x] Add SDK envelope validation tests.

## v0.1 Circuit Decision

- [ ] Pick first proving stack: Noir first unless benchmarking blocks it.
- [x] Define disclosure levels: city, district, cell, meter, and latlng.
- [ ] Decide dating-safe default H3 resolution policy for Sparkler integration.
- [x] Add verifier policy checks for maximum allowed disclosure level.
- [x] Add verifier policy checks for maximum allowed H3 resolution.
- [x] Define canonical integer encoding for lat/lng and timestamps.
- [ ] Define verification key distribution and versioning.

## v0.2 Prototype Circuit

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
- [ ] Interop test vectors.
- [ ] Sparkler location service integration.
- [ ] Dart and TypeScript package publishing.
