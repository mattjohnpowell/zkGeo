# Security Policy

## Secret Handling

This repository is public. Do not commit secrets, private keys, API keys, seed phrases, mnemonics, production endpoints with embedded credentials, real user coordinates, generated witnesses, or proof inputs that could identify a person.

Use local environment files for private configuration. Files matching `.env` and `.env.*` are ignored, except `.env.example`, which may contain placeholder values only.

Before pushing, run:

```powershell
npm run scan:secrets
```

The scanner is a lightweight guardrail, not a guarantee. Review diffs before publishing.

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
