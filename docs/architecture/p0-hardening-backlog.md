# P0 Architecture Hardening Backlog

## Batch 1 — Architecture and reproducibility

- **COS-ARCH-001:** architecture overview, security model, data classification, deployment model, testing strategy and ADR pack.
- **COS-ARCH-002:** clean dependency installation, Prisma generation, type checking, tests, lint and production build in CI.
- **COS-ARCH-003:** committed core migration baseline, missing claim-access migration and safe existing-database migration guard.

## Batch 2 — Authoritative permissions

- **COS-SEC-001:** authenticated `ActorContext`.
- **COS-SEC-002:** central permission catalogue.
- **COS-SEC-003:** enforce `VIEW` versus `EDIT`.
- **COS-SEC-004:** secure document movement.
- **COS-SEC-005:** secure close, reopen and deletion transitions.
- **COS-SEC-006:** secure delegation and revocation.
- **COS-SEC-007:** negative authorisation test matrix.

## Batch 3 — Files and records governance

- staged storage interface;
- byte-level file validation and quarantine;
- safe content delivery;
- immutable audit events;
- retention and legal-hold controls; and
- verified backup and restoration.

## P0 exit condition

No new claims-management or intelligence feature proceeds until the clean CI pipeline, blank-database migration, existing-database reconciliation and mutation authorisation gates pass.
