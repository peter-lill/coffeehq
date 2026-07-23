# ADR-005 — Staged and validated file lifecycle

**Status:** Accepted  
**Date:** 18 July 2026

## Context

CoffeeOS handles sensitive claims evidence and requires clear boundaries before further feature development.

## Decision

All files pass through staging, byte-level identification, validation, scanning/quarantine and commit before becoming accessible. Unsafe active content is never served inline under the application origin.

## Consequences

- New code must conform to this decision.
- Exceptions require a superseding ADR.
- Tests and documentation must demonstrate the decision where applicable.
