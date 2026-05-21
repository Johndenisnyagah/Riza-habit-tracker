/**
 * ============================================================================
 * RATE LIMITING MIDDLEWARE
 * ============================================================================
 *
 * Purpose:
 * - Protect the application from brute-force and DoS attacks
 * - Limit the number of requests a user/IP can make within a timeframe
 * - Specifically target sensitive authentication endpoints
 *
 * Configuration:
 * - Window: 15 minutes
 * - Max requests: 10 per window for auth routes
 */

import { rateLimit } from "express-rate-limit";

/**
 * Authentication Rate Limiter
 *
 * Specifically for login and registration endpoints to prevent brute-force attacks.
 * 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    message: "Too many attempts from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
