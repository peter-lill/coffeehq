# ADR-001 — Retain a modular monolith

**Status:** Accepted  
**Date:** 18 July 2026

## Context

CoffeeOS handles sensitive claims evidence and requires clear boundaries before further feature development.

## Decision

CoffeeOS remains one deployable application and one transactional database. Internal module boundaries are enforced in code. Service extraction requires a future ADR supported by operational evidence.

## Consequences

- New code must conform to this decision.
- Exceptions require a superseding ADR.
- Tests and documentation must demonstrate the decision where applicable.
