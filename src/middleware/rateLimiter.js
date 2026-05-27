import rateLimit from 'express-rate-limit';

/**
 * Rate limiting middleware for API endpoints
 * Limits requests to 100 per minute per authenticated user
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute (60 seconds)
  max: 100, // Maximum 100 requests per window
  
  // Extract user ID from authenticated request
  keyGenerator: (req) => {
    // Use user ID from JWT token (set by auth middleware)
    // If no user, fall back to IP address
    return req.user?.id?.toString() || req.ip;
  },
  
  // Custom handler for rate limit exceeded
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
    });
  },
  
  // Use standard rate limit headers
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});
