/**
 * Verification script for Rate Limiting
 * Tests that the authLimiter correctly blocks excessive requests.
 */

import { authLimiter } from "./middleware/rateLimiter.js";

async function testRateLimiter() {
  console.log("Testing Auth Rate Limiter Configuration...");

  // Mocking request and response
  const mockReq = {
    ip: "127.0.0.1",
    headers: {},
    app: {
      get: () => false // trust proxy
    }
  };

  let statusCode = 0;
  let body = null;
  let nextCalledCount = 0;

  const mockRes = {
    status: (code) => {
      statusCode = code;
      return mockRes;
    },
    json: (data) => {
      body = data;
      return mockRes;
    },
    send: (data) => {
      body = data;
      return mockRes;
    },
    setHeader: () => {},
    getHeader: () => {},
  };

  const next = () => {
    nextCalledCount++;
  };

  // Simulate 12 requests (limit is 10)
  for (let i = 0; i < 12; i++) {
    try {
      await authLimiter(mockReq, mockRes, next);
    } catch (err) {
      // Catch errors during the block phase if any
    }
  }

  console.log(`Requests allowed: ${nextCalledCount}`);

  if (nextCalledCount === 10 && statusCode === 429) {
    console.log("✅ Rate limiter correctly blocked after 10 requests");
    console.log("✅ Message received:", body.message);
  } else {
    console.error(`❌ Rate limiter check failed. Allowed ${nextCalledCount} requests. Status code: ${statusCode}`);
    process.exit(1);
  }
}

testRateLimiter();
