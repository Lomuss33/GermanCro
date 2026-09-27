import assert from "node:assert/strict";
import test from "node:test";
import { summarizeTimeZone } from "../src/facts/time-zone.js";

test("long timezone lists become compact, readable ranges", () => {
  assert.equal(summarizeTimeZone("UTC+02:00, UTC+03:00, UTC+12:00"), "UTC+02–+12");
  assert.equal(summarizeTimeZone("UTC-04:00, UTC-03:00, UTC, UTC+01:00"), "UTC−04–+01");
});

test("single zones and non-offset labels remain unchanged", () => {
  assert.equal(summarizeTimeZone("UTC+01:00"), "UTC+01:00");
  assert.equal(summarizeTimeZone("MEZ / MESZ"), "MEZ / MESZ");
  assert.equal(summarizeTimeZone("UTC+01:00, elsewhere, UTC+03:00"), "UTC+01:00, elsewhere, UTC+03:00");
});
