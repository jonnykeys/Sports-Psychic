/**
 * Zero-dependency Test Runner for Sports Psychic Test Suite
 * Compatible with any standard Node.js runtime or CI pipeline.
 */

const { runAllTests } = require("./scoring.test.js");

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
  }
};

console.log("\n========================================================");
console.log(" 🔮 SPORTS PSYCHIC AUTOMATED UNIT TEST SUITE");
console.log("========================================================\n");

const startTime = Date.now();

try {
  runAllTests(assert);
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
console.log(` Total Tests: ${results.length} | Passed: \x1b[32m${passCount}\x1b[0m | Failed: ${failCount > 0 ? `\x1b[31m${failCount}\x1b[0m` : "0"}`);
console.log(` Duration: ${elapsed}ms`);
console.log("--------------------------------------------------------\n");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log(" \x1b[32mAll test suites passed successfully!\x1b[0m\n");
  process.exit(0);
}
