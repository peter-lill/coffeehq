# CoffeeOS Architecture Overview

## Status

This document is the governing architecture baseline for the CoffeeOS hardening program commencing from CoffeeHQ v0.8.0.

## Architectural style

CoffeeOS is a **modular monolith**. It is one deployable application and one transactional PostgreSQL database, with explicit internal module boundaries. This keeps claim, evidence, document, communication, access and audit changes consistent without introducing distributed transactions.

## Runtime view

```text
Browser
  -> Next.js route, server action or API handler
  -> application use case
  -> domain policy and authorisation
  -> repository interface
  -> Prisma/PostgreSQL or storage adapter
  -> audit/outbox
```

The browser is untrusted. Route middleware and hidden buttons improve navigation but do not establish authority.

## Current source areas

| Area | Responsibility |
|---|---|
| `src/app` | HTTP/UI entry points and input-shape validation |
| `src/components` | Presentation only |
| `src/server/auth` | Authentication and sessions |
| `src/server/access` | Claim access and delegation policy |
| `src/server/services` | Application workflows |
| `src/server/repositories` | Prisma persistence operations |
| `src/server/intelligence` | Advisory specialist orchestration |
| `src/server/workcover` | WorkCover-specific qualification and decision boundaries |
| `src/lib/storage` | Storage implementations |

## Target dependency rules

- UI entry points call application use cases.
- Use cases receive an authenticated actor context.
- Use cases enforce permissions and domain invariants before persistence.
- Repositories do not read cookies, redirect users or determine the current actor.
- Modules do not import another module's Prisma implementation directly.
- Platform adapters do not contain claims decision rules.
- Intelligence components cannot write approved findings or decisions directly.

## Platform modules

The code will progressively consolidate into these business boundaries without a disruptive rewrite:

- identity and organisations;
- claims and parties;
- access and delegation;
- communications;
- documents and storage;
- evidence and procedural fairness;
- workflow and deadlines;
- decisions and reporting;
- imports and Roastery;
- intelligence; and
- audit and operations.

## Data ownership

PostgreSQL is authoritative for business metadata and workflow state. File bytes are held by the configured storage provider. Database rows and file objects cannot share one transaction, so file operations require staging, durable state and reconciliation.

## Background work

Mailbox ingestion, malware scanning, large imports, document conversion, intelligence runs and report generation must use durable jobs or an outbox. Long work must not depend on a browser request remaining connected.

## Production gates

Production use requires:

- reproducible blank-database migration;
- tested migration of the current database;
- explicit mutation permissions;
- safe file validation and delivery;
- immutable audit history;
- backup and restore proof; and
- human-controlled intelligence provenance.
