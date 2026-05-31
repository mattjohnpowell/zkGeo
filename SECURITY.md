# Security Policy

## AI-Assisted Development Notice

This repository is AI-assisted and vibe coded. That makes review discipline non-negotiable. Do not treat passing tests, generated code, or plausible-looking protocol text as evidence of cryptographic or product safety.

The security target is that a qualified external reviewer can inspect small, well-tested changes and clearly understand the claims, assumptions, and limits. No code in this repository should be represented as production-safe until it has received appropriate expert review.

## Secret Handling

This repository is public. Do not commit secrets, private keys, API keys, seed phrases, mnemonics, production endpoints with embedded credentials, real user coordinates, generated witnesses, or proof inputs that could identify a person.

Use local environment files for private configuration. Files matching `.env` and `.env.*` are ignored, except `.env.example`, which may contain placeholder values only.

Before pushing, run:

```powershell
npm run scan:secrets
```

The scanner is a lightweight guardrail, not a guarantee. Review diffs before publishing.

## Testing Standard

zkGeo should be developed as a security-sensitive protocol. Every behavior change that can be verified locally must include tests in the same change.

Required coverage for protocol and SDK changes:

- acceptance tests for valid inputs
- rejection tests for malformed, expired, over-precise, or policy-violating inputs
- regression tests for any discovered bug
- explicit tests that placeholder verification cannot be mistaken for production proof verification

If a behavior cannot be tested locally, document the reason in the pull request or commit notes and add the smallest useful safety check available, such as schema validation, fixture validation, or a threat-model note.

Security-sensitive changes should be written so an expert can try to break them:

- keep diffs small enough to review
- include negative tests, not only happy-path tests
- include fixtures for cross-implementation behavior
- state what is not being proven
- avoid clever abstractions around cryptographic or safety boundaries

Before committing or pushing, run:

```powershell
npm test
npm run scan:secrets
```

## Coordinates and Witnesses

zkGeo is a location privacy project, so location data should be treated as sensitive even when it is not an API secret.

Do not commit:

- real latitude/longitude values tied to a person
- mobile device location logs
- private circuit witnesses
- generated proof inputs containing private coordinates
- app telemetry that can reconstruct movement

Use synthetic coordinates in tests and examples.

## Reporting Issues

Report security issues privately to the repository owner. Do not open a public issue containing exploit details, secrets, private keys, or real user location data.
