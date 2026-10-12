/**
 * @fileoverview NFL Calendar and Date Utility Functions
 * Pure, deterministic functions for calculating NFL weeks, Wednesday rollover boundaries,
 * and game kickoff lockouts.
 * @module utils/dates
 */

/**
 * Official 2026 NFL Regular Season Week Start Dates.
 * Every week begins on Wednesday (the day before Thursday Night Football) at 00:00:00 local time.
 * @type {readonly string[]}
 */
const NFL_2026_WEEK_STARTS = Object.freeze([
  "2026-09-09", // Week 1 (Wed)
  "2026-09-16", // Week 2 (Wed)
  "2026-09-23", // Week 3 (Wed)
  "2026-09-30", // Week 4 (Wed)
  "2026-10-07", // Week 5 (Wed)
  "2026-10-14", // Week 6 (Wed)
  "2026-10-21", // Week 7 (Wed)
  "2026-10-28", // Week 8 (Wed)
  "2026-11-04", // Week 9 (Wed)
  "2026-11-11", // Week 10 (Wed)
  "2026-11-18", // Week 11 (Wed)
  "2026-11-25", // Week 12 (Wed)
  "2026-12-02", // Week 13 (Wed)
  "2026-12-09", // Week 14 (Wed)
  "2026-12-16", // Week 15 (Wed)
  "2026-12-23", // Week 16 (Wed)
  "2026-12-30", // Week 17 (Wed)
  "2027-01-06"  // Week 18 (Wed)
]);

/**
 * Returns the current NFL regular season week number (1 to 18) based on a given date.
 * Switches to the upcoming week every Wednesday at midnight.
 * 
 * @param {Date|string|number} [d=new Date()] Date to evaluate
 * @returns {number} NFL week number clamped between 1 and 18
 */
function getCurrentNFLWeek(d = new Date()) {
  const dateObj = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dateObj.getTime())) return 1;

  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const todayStr = `${y}-${m}-${day}`;

  let week = 1;
  for (let i = 0; i < NFL_2026_WEEK_STARTS.length; i++) {
    if (todayStr >= NFL_2026_WEEK_STARTS[i]) {
      week = i + 1;
    } else {
      break;
    }
  }

  return Math.min(18, Math.max(1, week));
}

/**
 * Returns the date boundary strings for a specific NFL week.
 * 
 * @param {number} weekNum Week number (1-18)
 * @returns {{ startDate: string, nextWeekStartDate: string|null }}
 */
function getWeekDateBounds(weekNum) {
  const clamped = Math.min(18, Math.max(1, weekNum));
  const idx = clamped - 1;
  return {
    startDate: NFL_2026_WEEK_STARTS[idx],
    nextWeekStartDate: (idx + 1 < NFL_2026_WEEK_STARTS.length) ? NFL_2026_WEEK_STARTS[idx + 1] : null
  };
}

/**
 * Determines whether a game has kicked off and is locked against pick submissions.
 * 
 * @param {string|Date} kickoffTime Game kickoff timestamp (ISO string or Date)
 * @param {number} [bufferMinutes=0] Grace period buffer in minutes
 * @param {Date} [now=new Date()] Current reference time
 * @returns {boolean} True if the game is locked
 */
function isGameLocked(kickoffTime, bufferMinutes = 0, now = new Date()) {
  if (!kickoffTime) return false;
  const kickoff = (kickoffTime instanceof Date) ? kickoffTime : new Date(kickoffTime);
  if (isNaN(kickoff.getTime())) return false;

  const lockTime = new Date(kickoff.getTime() + bufferMinutes * 60 * 1000);
  const currentTime = (now instanceof Date) ? now : new Date(now);

  return currentTime.getTime() >= lockTime.getTime();
}

/**
 * Formats an ISO date string into human-readable date & time strings.
 * 
 * @param {string|Date} dateInput ISO timestamp
 * @param {string} [timeZone] Optional IANA timezone string (defaults to local)
 * @returns {{ dayOfWeek: string, formattedDate: string, formattedTime: string }}
 */
function formatGameDateTime(dateInput, timeZone) {
  const d = (dateInput instanceof Date) ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return { dayOfWeek: "", formattedDate: "", formattedTime: "TBD" };
  }

  const options = timeZone ? { timeZone } : {};

  const dayOfWeek = d.toLocaleDateString("en-US", { ...options, weekday: "short" });
  const formattedDate = d.toLocaleDateString("en-US", { ...options, month: "short", day: "numeric" });
  const formattedTime = d.toLocaleTimeString("en-US", { ...options, hour: "numeric", minute: "2-digit" });

  return { dayOfWeek, formattedDate, formattedTime };
}

// Module export compatibility (Node.js CommonJS + ES Module fallback)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NFL_2026_WEEK_STARTS,
    getCurrentNFLWeek,
    getWeekDateBounds,
    isGameLocked,
    formatGameDateTime
  };
}
if (typeof window !== "undefined") {
  window.DatesUtil = {
    NFL_2026_WEEK_STARTS,
    getCurrentNFLWeek,
    getWeekDateBounds,
    isGameLocked,
    formatGameDateTime
  };
}

