# 0001: Use Noir as the First Proving Stack Candidate

Status: accepted for prototype spike.

## Context

zkGeo needs a production proof system eventually, but the repository is still at v0. The immediate goal is to prove the full development pipeline before claiming any production cryptographic verification:

- write a small circuit
- compile it
- generate a proof
- verify the proof
- bind proof verification to the existing envelope and policy checks
- produce synthetic test vectors

The first real protocol target remains:

```txt
The prover knows a latitude and longitude inside the public H3 cell,
and the proof is bound to the stated subject, nonce, disclosure level,
and validity window.
```

## Decision

Use Noir as the first proving stack candidate for the prototype circuit work.

Noir is only accepted as the first candidate, not as a final production commitment. If benchmarking, circuit complexity, proof size, verifier cost, mobile proving, or H3 implementation constraints make Noir unsuitable, the decision must be revisited before v1.

## Rationale

- Noir is designed for portable zero-knowledge circuit development.
- It lets the repo build circuit logic separately from application-specific SDK code.
- It should support a staged spike: coordinate bounds first, public input binding next, H3 membership later.
- It avoids committing the JavaScript SDK to a particular production verifier API too early.

## Risks

- H3 cell membership may be expensive or awkward to implement in-circuit.
- Mobile proving may be too slow or memory-intensive.
- Verification key distribution and versioning are unresolved.
- Proof size and verifier cost are not benchmarked.
- Tooling is not currently installed in this workspace, so circuit tests are not yet runnable here.

## Security Notes

The initial Noir circuits are prototypes. They must not be described as production verification.

Every circuit change must include tests or documented manual verification steps. Once Noir tooling is installed, CI should compile and test circuits in addition to the JavaScript SDK tests.

## Next Steps

- Add a prototype circuit package skeleton.
- Start with a minimal coordinate-bounds circuit.
- Add synthetic circuit fixtures.
- Add proof generation and verifier CLIs after the circuit pipeline is real.
- Revisit this decision after desktop benchmarking.
