# ADR-006 — Durable jobs and outbox

**Status:** Accepted  
**Date:** 18 July 2026

## Context

CoffeeOS handles sensitive claims evidence and requires clear boundaries before further feature development.

## Decision

Mailbox ingestion, scanning, imports, conversions, intelligence and large reports use durable jobs with idempotency, retries, failure states and observable progress.

## Consequences

- New code must conform to this decision.
- Exceptions require a superseding ADR.
- Tests and documentation must demonstrate the decision where applicable.
