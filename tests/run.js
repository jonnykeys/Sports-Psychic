/**
 * Zero-dependency Test Runner for Sports Psychic Test Suite
 * Compatible with any standard Node.js runtime or CI pipeline.
 */

const { runAllTests: runScoringTests } = require("./scoring.test.js");
const { runDatesTests } = require("./dates.test.js");
const { runTeamsTests } = require("./teams.test.js");
const { runEspnTests } = require("./espn.test.js");

const results = [];
let passCount = 0;
let failCount = 0;

const assert = {
  equal(actual, expected, message) {
    if (actual === expected) {
      passCount++;
      results.push({ pass: true, message });
    } else {
      failCount++;
      results.push({
        pass: false,
        message: `${message} (Expected: ${expected}, Got: ${actual})`
      });
    }
  },
  deepEqual(actual, expected, message) {
    const actStr = JSON.stringify(actual);
    const expStr = JSON.stringify(expected);
    if (actStr === expStr) {
      passCount++;
      results.push({ pass: true, message });
    } else {
      failCount++;
      results.push({
        pass: false,
        message: `${message} (Expected: ${expStr}, Got: ${actStr})`
      });
    }
  }
};

console.log("\n========================================================");
console.log(" 🔮 SPORTS PSYCHIC AUTOMATED UNIT TEST SUITE");
console.log("========================================================\n");

const startTime = Date.now();

try {
  console.log("  [Suite 1/4] Core Scoring & Multipliers");
  runScoringTests(assert);

  console.log("  [Suite 2/4] NFL Dates & Rollover Schedule");
  runDatesTests(assert);

  console.log("  [Suite 3/4] 32-Team Directory & Aliases");
  runTeamsTests(assert);

  console.log("  [Suite 4/4] ESPN REST Telemetry & Game Parser\n");
  runEspnTests(assert);
} catch (err) {
  console.error("FATAL TEST EXCEPTION:", err);
  process.exit(1);
}

const elapsed = Date.now() - startTime;

results.forEach(res => {
  if (res.pass) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m ${res.message}`);
  } else {
    console.log(`  \x1b[31m✖ FAIL\x1b[0m ${res.message}`);
  }
});

console.log("\n--------------------------------------------------------");
console.log(` Total Assertions: ${results.length} | Passed: \x1b[32m${passCount}\x1b[0m | Failed: ${failCount > 0 ? `\x1b[31m${failCount}\x1b[0m` : "0"}`);
console.log(` Duration: ${elapsed}ms`);
console.log("--------------------------------------------------------\n");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log(" \x1b[32mAll test suites passed successfully!\x1b[0m\n");
  process.exit(0);
}
