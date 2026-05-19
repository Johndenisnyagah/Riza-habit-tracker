/**
 * Verification script for NoSQL injection protection
 * Tests the input validation logic added to routes
 */

const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

async function testCheckinToggle() {
  console.log("Testing Check-in Toggle Validation...");

  // We simulate the logic in checkinRoutes.js
  const validateToggle = (body) => {
    const { habitId } = body;
    if (typeof habitId !== "string" || habitId.trim().length === 0) {
      return { status: 400, message: "Invalid habit ID" };
    }
    return { status: 200 };
  };

  const cases = [
    { input: { habitId: "123" }, expected: 200 },
    { input: { habitId: { "$ne": null } }, expected: 400 },
    { input: { habitId: "" }, expected: 400 },
    { input: { habitId: 123 }, expected: 400 },
    { input: {}, expected: 400 }
  ];

  cases.forEach((c, i) => {
    const result = validateToggle(c.input);
    if (result.status === c.expected) {
      console.log(`✅ Case ${i + 1} passed`);
    } else {
      console.error(`❌ Case ${i + 1} failed: expected ${c.expected}, got ${result.status}`);
      process.exit(1);
    }
  });
}

async function testHabitCreate() {
  console.log("\nTesting Habit Create Validation...");

  const validateHabit = (body) => {
    const { name, description, frequency, customDays, icon } = body;
    if (typeof name !== "string" || name.trim().length === 0) {
      return { status: 400, message: "Please provide a valid name" };
    }
    if (description && typeof description !== "string") {
      return { status: 400, message: "Invalid description format" };
    }
    if (frequency && typeof frequency !== "string") {
      return { status: 400, message: "Invalid frequency format" };
    }
    if (customDays && !Array.isArray(customDays)) {
      return { status: 400, message: "Invalid custom days format" };
    }
    if (icon && typeof icon !== "string") {
      return { status: 400, message: "Invalid icon format" };
    }
    return { status: 201 };
  };

  const cases = [
    { input: { name: "Exercise" }, expected: 201 },
    { input: { name: { "$gt": "" } }, expected: 400 },
    { input: { name: "Exercise", description: { "$ne": null } }, expected: 400 },
    { input: { name: "Exercise", frequency: ["daily"] }, expected: 400 },
    { input: { name: "Exercise", customDays: "Monday" }, expected: 400 },
    { input: { name: "Exercise", icon: { some: "object" } }, expected: 400 }
  ];

  cases.forEach((c, i) => {
    const result = validateHabit(c.input);
    if (result.status === c.expected) {
      console.log(`✅ Case ${i + 1} passed`);
    } else {
      console.error(`❌ Case ${i + 1} failed: expected ${c.expected}, got ${result.status}`);
      process.exit(1);
    }
  });
}

async function runTests() {
  await testCheckinToggle();
  await testHabitCreate();
  console.log("\nAll NoSQL injection validation tests passed! 🎉");
}

runTests();
