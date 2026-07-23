import { describe, expect, it } from "vitest";

import { isClaimAccessActive } from "@/server/access/claim-access-policy";

const now = new Date("2026-07-16T12:00:00.000Z");

describe("isClaimAccessActive", () => {
  it("allows an open-ended active grant", () => {
    expect(
      isClaimAccessActive(
        { startsAt: null, endsAt: null, revokedAt: null },
        now,
      ),
    ).toBe(true);
  });

  it("rejects a future grant", () => {
    expect(
      isClaimAccessActive(
        {
          startsAt: new Date("2026-07-17T00:00:00.000Z"),
          endsAt: null,
          revokedAt: null,
        },
        now,
      ),
    ).toBe(false);
  });

  it("rejects an expired grant", () => {
    expect(
      isClaimAccessActive(
        {
          startsAt: null,
          endsAt: new Date("2026-07-16T11:59:59.000Z"),
          revokedAt: null,
        },
        now,
      ),
    ).toBe(false);
  });

  it("treats the exact end time as expired", () => {
    expect(
      isClaimAccessActive(
        {
          startsAt: null,
          endsAt: now,
          revokedAt: null,
        },
        now,
      ),
    ).toBe(false);
  });

  it("rejects a revoked grant even when dates are active", () => {
    expect(
      isClaimAccessActive(
        {
          startsAt: null,
          endsAt: null,
          revokedAt: new Date("2026-07-16T10:00:00.000Z"),
        },
        now,
      ),
    ).toBe(false);
  });
});
