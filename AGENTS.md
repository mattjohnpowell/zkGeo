# AGENTS.md

Behavioral guidelines for this repository:

- This repository is AI-assisted and vibe coded; treat generated code and text as untrusted until tested and reviewed.
- Keep changes small and traceable to the requested protocol work.
- Do not present placeholder cryptography as production verification.
- Prefer explicit threat-model notes over vague privacy claims.
- Add or update tests for every behavior change that can be verified locally.
- Treat missing tests as a security risk. If a change cannot be tested locally, document why and add the smallest useful safety check instead.
- Run `npm test` and `npm run scan:secrets` before committing or pushing.
- Match existing style and avoid speculative abstractions.
