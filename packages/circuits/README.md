# zkGeo Circuits

Status: prototype scaffold.

This package is reserved for zkGeo zero-knowledge circuits. It is not production cryptography and must not be represented as production proof verification.

The first proving stack candidate is Noir. The current workspace does not require Noir tooling to run the JavaScript SDK tests, because `nargo` may not be installed on every developer machine yet.

Planned circuit progression:

1. Coordinate absolute-magnitude bounds proof for integer microdegree latitude and longitude.
2. Public input binding for disclosure level, subject, nonce, and validity window.
3. Minimal geospatial membership proof.
4. H3 cell-membership proof if feasible in-circuit.

Expected local commands once Noir is installed:

```powershell
cd packages/circuits
nargo check
nargo test
```

Do not commit private witnesses, real coordinates, generated proof inputs tied to a person, proving keys, or production verification keys.
