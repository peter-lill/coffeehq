# ADR-003 — Single-organisation initial deployment

**Status:** Accepted  
**Date:** 18 July 2026

## Context

CoffeeOS handles sensitive claims evidence and requires clear boundaries before further feature development.

## Decision

The initial production installation serves one organisation. Cross-organisation access fails closed. Full multi-tenancy requires explicit active-organisation selection, isolation testing and a new ADR.

## Consequences

- New code must conform to this decision.
- Exceptions require a superseding ADR.
- Tests and documentation must demonstrate the decision where applicable.
