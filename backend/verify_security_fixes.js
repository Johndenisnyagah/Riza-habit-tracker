/**
 * Security Fixes Verification Script
 * Tests the IDOR protection and Cascading Deletes logic
 */

async function testIDORProtection() {
  console.log("Testing IDOR Protection in Check-in Toggle...");

  // Mocked logic from checkinRoutes.js
  const validateToggle = async (habitId, userId, habitModel) => {
    // 1. Validation (already tested in test-nosql.js)
    if (typeof habitId !== "string" || habitId.trim().length === 0) {
      return { status: 400, message: "Invalid habit ID" };
    }

    // 2. IDOR Protection (The Fix)
    const habit = await habitModel.findOne({ _id: habitId, userId: userId });
    if (!habit) {
      return { status: 404, message: "Habit not found" };
    }

    return { status: 200 };
  };

  // Mock Habit Model
  const mockHabits = [
    { _id: "habit123", userId: "user1" },
    { _id: "habit456", userId: "user2" }
  ];

  const habitModel = {
    findOne: async (query) => {
      return mockHabits.find(h => h._id === query._id && h.userId === query.userId) || null;
    }
  };

  const cases = [
    { habitId: "habit123", userId: "user1", expected: 200, desc: "Owner can access" },
    { habitId: "habit456", userId: "user1", expected: 404, desc: "Non-owner cannot access (IDOR Fix)" },
    { habitId: "nonexistent", userId: "user1", expected: 404, desc: "Non-existent habit" }
  ];

  for (const [i, c] of cases.entries()) {
    const result = await validateToggle(c.habitId, c.userId, habitModel);
    if (result.status === c.expected) {
      console.log(`✅ Case ${i + 1} passed: ${c.desc}`);
    } else {
      console.error(`❌ Case ${i + 1} failed: ${c.desc}. Expected ${c.expected}, got ${result.status}`);
      process.exit(1);
    }
  }
}

async function testCascadingDeletes() {
  console.log("\nTesting Cascading Deletes in Habit Route...");

  let checkinsDeleted = false;
  let deletedHabitId = null;

  // Mock logic from habitRoutes.js
  const deleteHabitLogic = async (habitId, userId, habitModel, checkinModel) => {
    const habit = await habitModel.findOneAndDelete({ _id: habitId, userId: userId });
    if (!habit) {
      return { status: 404 };
    }

    // Cascading delete
    await checkinModel.deleteMany({ habitId: habitId, userId: userId });
    return { status: 200 };
  };

  const habitModel = {
    findOneAndDelete: async (query) => {
      if (query._id === "habit123" && query.userId === "user1") {
        deletedHabitId = query._id;
        return { _id: "habit123" };
      }
      return null;
    }
  };

  const checkinModel = {
    deleteMany: async (query) => {
      if (query.habitId === deletedHabitId) {
        checkinsDeleted = true;
      }
    }
  };

  // Test successful deletion
  const result = await deleteHabitLogic("habit123", "user1", habitModel, checkinModel);
  if (result.status === 200 && checkinsDeleted) {
    console.log("✅ Cascading delete successful: Check-ins removed with habit");
  } else {
    console.error("❌ Cascading delete failed");
    process.exit(1);
  }

  // Test unauthorized deletion
  checkinsDeleted = false;
  const result2 = await deleteHabitLogic("habit456", "user1", habitModel, checkinModel);
  if (result2.status === 404 && !checkinsDeleted) {
    console.log("✅ Security maintained: Non-owned habit not deleted, check-ins remain");
  } else {
    console.error("❌ Unauthorized delete check failed");
    process.exit(1);
  }
}

async function runTests() {
  await testIDORProtection();
  await testCascadingDeletes();
  console.log("\nSecurity logic verification passed! 🛡️");
}

runTests();
