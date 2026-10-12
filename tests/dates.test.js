/**
 * @fileoverview Unit tests for NFL dates and schedule rollover utility.
 */

const {
  NFL_2026_WEEK_STARTS,
  getCurrentNFLWeek,
  getWeekDateBounds,
  isGameLocked,
  formatGameDateTime
} = require("../src/utils/dates.js");

function runDatesTests(assert) {
  assert.equal(NFL_2026_WEEK_STARTS.length, 18, "NFL 2026 schedule contains 18 weeks");

  // Pre-season date defaults to Week 1
  assert.equal(getCurrentNFLWeek(new Date("2026-08-15")), 1, "Pre-season date returns Week 1");

  // Week 1 Wednesday kickoff boundary
  assert.equal(getCurrentNFLWeek(new Date("2026-09-09T00:00:00")), 1, "Sep 9, 2026 is Week 1");
  assert.equal(getCurrentNFLWeek(new Date("2026-09-15T23:59:59")), 1, "Sep 15, 2026 is still Week 1");

  // Week 2 Wednesday rollover
  assert.equal(getCurrentNFLWeek(new Date("2026-09-16T00:00:00")), 2, "Sep 16, 2026 rolls over to Week 2");

  // Week 4 Wednesday
  assert.equal(getCurrentNFLWeek(new Date("2026-09-30T12:00:00")), 4, "Sep 30, 2026 is Week 4");

  // Post-season / late dates clamped to Week 18
  assert.equal(getCurrentNFLWeek(new Date("2027-02-10")), 18, "Dates past Week 18 are clamped to 18");

  // Week date bounds
  const wk1Bounds = getWeekDateBounds(1);
  assert.equal(wk1Bounds.startDate, "2026-09-09", "Week 1 start date is 2026-09-09");
  assert.equal(wk1Bounds.nextWeekStartDate, "2026-09-16", "Week 1 next week start is 2026-09-16");

  // Game Lockout tests
  const kickoff = "2026-10-04T17:00:00Z";
  const beforeKickoff = new Date("2026-10-04T16:59:00Z");
  const atKickoff = new Date("2026-10-04T17:00:00Z");
  const afterKickoff = new Date("2026-10-04T17:05:00Z");

  assert.equal(isGameLocked(kickoff, 0, beforeKickoff), false, "Game is NOT locked 1 minute before kickoff");
  assert.equal(isGameLocked(kickoff, 0, atKickoff), true, "Game IS locked at kickoff time");
  assert.equal(isGameLocked(kickoff, 0, afterKickoff), true, "Game IS locked after kickoff time");

  // Grace period buffer test (e.g. 10 minute grace)
  assert.equal(isGameLocked(kickoff, 10, afterKickoff), false, "Game is NOT locked within 10-minute buffer");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { runDatesTests };
}

