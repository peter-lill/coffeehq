# ADR-008 — Intelligence is advisory

**Status:** Accepted  
**Date:** 18 July 2026

## Context

CoffeeOS handles sensitive claims evidence and requires clear boundaries before further feature development.

## Decision

Intelligence may analyse, summarise and draft, but cannot determine liability, finalise a decision, send external correspondence or silently alter approved findings. Human approval and provenance are mandatory.

## Consequences

- New code must conform to this decision.
- Exceptions require a superseding ADR.
- Tests and documentation must demonstrate the decision where applicable.
