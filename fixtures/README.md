# zkGeo Fixtures

Fixtures are synthetic protocol test vectors. They must not contain real user coordinates, private witnesses, production proof bytes, API keys, or secrets.

Envelope fixtures currently test transport and verifier-policy validation only. They do not represent production zero-knowledge proof verification.

Witness fixtures are synthetic inputs for prototype circuits. They are intended to keep SDK encoding and future circuit inputs aligned. They are not private witnesses from real users.

Each fixture case should state:

- whether the envelope is expected to pass validation
- the verifier policy used for the check
- the reason for acceptance or rejection
