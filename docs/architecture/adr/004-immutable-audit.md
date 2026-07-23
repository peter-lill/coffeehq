# ADR-004 — Immutable platform audit

**Status:** Accepted  
**Date:** 18 July 2026

## Context

CoffeeOS handles sensitive claims evidence and requires clear boundaries before further feature development.

## Decision

Business timelines do not replace audit history. Security-sensitive actions are recorded with actor ID, organisation, target, outcome and correlation ID. Audit records do not cascade-delete with business records.

## Consequences

- New code must conform to this decision.
- Exceptions require a superseding ADR.
- Tests and documentation must demonstrate the decision where applicable.
