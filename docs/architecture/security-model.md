# CoffeeOS Security Model

## Trust boundaries

Untrusted inputs include browser forms, route parameters, email content, email headers, attachments, archive contents, imported ChatGPT data and intelligence-provider output.

## Authentication

Authentication establishes a user and session. The server derives an `ActorContext` from the session; user IDs, organisation IDs, roles and permissions must not be accepted from client form data.

## Authorisation

Authorisation is capability based. The minimum catalogue is:

- `claim.read`, `claim.create`, `claim.edit`, `claim.transfer`, `claim.close`, `claim.reopen`, `claim.delete`;
- `document.read`, `document.upload`, `document.move`, `document.delete`;
- `communication.read`, `communication.file`;
- `evidence.read`, `evidence.manage`;
- `access.delegate`, `access.revoke`;
- `import.review`, `import.execute`;
- `user.read`, `user.manage`; and
- `audit.read`.

A claim `VIEW` grant is read-only. An `EDIT` grant does not automatically authorise closure, reopening, transfer, deletion, delegation or determination.

## Tenant boundary

The initial production deployment is single-organisation. Organisation IDs remain mandatory on tenant-owned records and all cross-organisation operations fail closed.

## File security

Files must be identified from bytes rather than sender MIME type. Active content is blocked or quarantined. Unsafe or unknown content is delivered as an attachment and must not execute under the CoffeeOS origin.

## Intelligence security

Intelligence receives only authorised source records. Outputs require versioned schemas, immutable source references and human review. Intelligence cannot determine liability, finalise decisions or send external communications automatically.

## Audit

Security-sensitive reads, mutations, access grants, imports and intelligence activity require immutable audit events linked to an authenticated actor and correlation ID.
