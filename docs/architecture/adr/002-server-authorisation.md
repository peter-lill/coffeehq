# ADR-002 — Server-side permissions are authoritative

**Status:** Accepted  
**Date:** 18 July 2026

## Context

CoffeeOS handles sensitive claims evidence and requires clear boundaries before further feature development.

## Decision

Application use cases authorise an authenticated actor. Client identifiers, hidden controls and route middleware are not security boundaries. Every mutation requires an explicit permission and negative tests.

## Consequences

- New code must conform to this decision.
- Exceptions require a superseding ADR.
- Tests and documentation must demonstrate the decision where applicable.
