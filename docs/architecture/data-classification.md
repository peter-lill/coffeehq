# CoffeeOS Data Classification

## Restricted claims information

The following is treated as restricted by default:

- medical certificates, reports, diagnoses and capacity information;
- psychological injury narratives and traumatic events;
- domestic and family violence information;
- allegations, witness statements and investigation material;
- identity, contact and employment information;
- payroll and financial records;
- raw emails and attachments;
- decision reasoning and draft RFD material; and
- access and audit records.

## Handling requirements

Restricted information must be:

- accessible only through authenticated, authorised server operations;
- encrypted in transit;
- encrypted at rest by the infrastructure layer;
- excluded from application logs and error traces;
- excluded from source packages and development fixtures;
- retained and disposed of under an approved records policy; and
- provided to intelligence services only under an approved provider and data-residency arrangement.

## Development data

Development and automated tests should use synthetic records. Source release packages must exclude `.env`, storage, uploads, database dumps, logs, certificates and private keys.
