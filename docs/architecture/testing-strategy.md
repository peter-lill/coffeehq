# CoffeeOS Testing Strategy

## Validation gate

Every change must pass:

```bash
npm run db:validate
npm run db:generate
npm run typecheck
npm test
npm run lint
npm run build
```

CI additionally provisions a blank PostgreSQL database and runs every committed migration.

## Required test layers

- unit tests for policy, parsing and domain rules;
- integration tests for repositories and transactions;
- authorisation tests for every sensitive command;
- migration tests for blank and upgraded databases;
- storage failure and reconciliation tests;
- mailbox idempotency tests;
- API route access tests; and
- browser tests for critical claim workflows.

## Security test minimum

Every sensitive mutation requires tests for:

- unauthenticated actor;
- wrong organisation;
- no claim access;
- view-only access;
- forged record ID;
- invalid lifecycle state; and
- successful authorised operation.
