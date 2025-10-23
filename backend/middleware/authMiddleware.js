/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE
 * ============================================================================
 *
 * Purpose:
 * - Protects routes that require user authentication
 * - Verifies JWT tokens from client requests
 * - Extracts user information from valid tokens
 * - Blocks unauthorized access to protected endpoints
 *
 * How It Works:
 * 1. Client sends request with JWT token in Authorization header
 * 2. Middleware extracts token from "Bearer <token>" format
 * 3. Verifies token signature using JWT_SECRET from .env
 * 4. Decodes token payload (contains user id and email)
 * 5. Attaches user info to request object (req.user)
 * 6. Passes control to next middleware/route handler
 *
 * Token Format:
 * - Header: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * - Must start with "Bearer " prefix
 * - Token generated during login with 1-hour expiration
 *
 * Protected Routes:
 * - GET  /api/auth/profile (get user profile)
 * - PUT  /api/auth/profile (update profile)
 * - All /api/habits routes (CRUD operations)
 * - All /api/checkins routes (check-in management)
 * - All /api/logins routes (login tracking)
 *
 * Security Features:
 * - Validates token signature (prevents tampering)
 * - Checks token expiration (1 hour from creation)
 * - Requires exact "Bearer " prefix format
 * - Logs errors for debugging
 *
 * Error Responses:
 * - 401: No token provided
 * - 401: Invalid token format (missing "Bearer ")
 * - 401: Token signature invalid or expired
 *
 * Usage in Routes:
 * ```javascript
 * import { protect } from "../middleware/authMiddleware.js";
 *
 * // Protected route - requires authentication
 * router.get("/profile", protect, async (req, res) => {
 *   // req.user contains decoded token data
 *   const userId = req.user.id;
 *   // ... route logic
 * });
 * ```
 *
 * Token Payload Structure:
 * - id: User's MongoDB ObjectId
 * - email: User's email address
 * - iat: Issued at timestamp
 * - exp: Expiration timestamp
 *
 * Author: John Denis Nyagah
 * ============================================================================
 */

import jwt from "jsonwebtoken";

/**
 * Protect Middleware Function
 *
 * Purpose: Verify JWT token and authenticate user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 *
 * Request Headers Expected:
 * - Authorization: "Bearer <jwt-token>"
 *
 * Success Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token with JWT_SECRET
 * 3. Decode token payload
 * 4. Attach user data to req.user
 * 5. Call next() to proceed to route handler
 *
 * Error Flow:
 * 1. Missing or invalid token format → 401 response
 * 2. Invalid or expired token → 401 response
 * 3. Log error for debugging
 *
 * Side Effects:
 * - Modifies req object by adding req.user property
 * - req.user contains: { id, email, iat, exp }
 */
export const protect = (req, res, next) => {
  try {
    // ========================================================================
    // STEP 1: Extract Authorization Header
    // ========================================================================
    /**
     * Check for Authorization header in request
     * Expected format: "Authorization: Bearer <token>"
     *
     * Common client-side implementation:
     * fetch('/api/habits', {
     *   headers: {
     *     'Authorization': `Bearer ${localStorage.getItem('token')}`
     *   }
     * })
     */
    const authHeader = req.headers.authorization;

    // Validate header exists and has correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // ========================================================================
    // STEP 2: Extract Token from Header
    // ========================================================================
    /**
     * Remove "Bearer " prefix to get raw JWT token
     *
     * Example:
     * Input:  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     * Output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     */
    const token = authHeader.split(" ")[1];

    // ========================================================================
    // STEP 3: Verify and Decode Token
    // ========================================================================
    /**
     * Verify token signature and decode payload
     *
     * jwt.verify() checks:
     * - Signature is valid (signed with JWT_SECRET)
     * - Token has not expired (exp claim)
     * - Token is well-formed
     *
     * Returns decoded payload on success:
     * {
     *   id: "507f1f77bcf86cd799439011",
     *   email: "user@example.com",
     *   iat: 1634567890,  // Issued at
     *   exp: 1634571490   // Expires at (1 hour later)
     * }
     *
     * Throws error if:
     * - Signature doesn't match
     * - Token is expired
     * - Token is malformed
     */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ========================================================================
    // STEP 4: Attach User Data to Request
    // ========================================================================
    /**
     * Store decoded user information in request object
     * Makes user data available to all subsequent middleware and route handlers
     *
     * Usage in route:
     * const userId = req.user.id;
     * const userEmail = req.user.email;
     */
    req.user = decoded;

    // ========================================================================
    // STEP 5: Proceed to Next Middleware/Route
    // ========================================================================
    /**
     * Call next() to pass control to the next function in the chain
     * This could be another middleware or the actual route handler
     */
    next();
  } catch (error) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    /**
     * Catch any errors during token verification
     *
     * Common error types:
     * - JsonWebTokenError: Invalid token signature
     * - TokenExpiredError: Token has expired (> 1 hour old)
     * - NotBeforeError: Token used before valid time
     *
     * All errors result in 401 Unauthorized response
     * Client should redirect to login page
     */
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Token is invalid or expired" });
  }
};
