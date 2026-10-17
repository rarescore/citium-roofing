import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { adminTokenValid, channelOf, dollarsToCents, issueAdminToken, passwordsMatch } from "./admin-session.ts";

describe("office password", () => {
  it("rejects a missing or wrong password", () => {
    assert.equal(passwordsMatch("please", ""), false);
    assert.equal(passwordsMatch("nope", "correct-horse"), false);
    assert.equal(passwordsMatch("correct-horse", "correct-horse"), true);
  });

  it("accepts a signed token only until it expires", () => {
    const token = issueAdminToken("secret", 1_000, 50);
    assert.equal(adminTokenValid(token, "secret", 1_040), true);
    assert.equal(adminTokenValid(token, "secret", 1_060), false);
    assert.equal(adminTokenValid(token, "other", 1_010), false);
    assert.equal(adminTokenValid("v1.2000.forged", "secret", 1_010), false);
  });
});

describe("dashboard facts", () => {
  it("does not call direct traffic organic", () => {
    assert.equal(channelOf("google", "cpc"), "google");
    assert.equal(channelOf("google", "organic"), "organic");
    assert.equal(channelOf("instagram", ""), "instagram");
    assert.equal(channelOf("facebook", "paid"), "facebook");
    assert.equal(channelOf("direct", ""), "other");
    assert.equal(dollarsToCents("12500.50"), 1_250_050);
    assert.equal(dollarsToCents(""), null);
    assert.equal(dollarsToCents("-5"), null);
  });
});
