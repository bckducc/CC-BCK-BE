import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 60000,
  max: 100,
  keyGenerator: (req) => {
    return req.user?.id?.toString() || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
