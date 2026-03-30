const MOCK_API_KEYS = {
  'swiggy': 'sw_live_gigshield_a1b2c3d4e5f6',
  'zomato': 'zm_prod_gigshield_x9y8z7w6v5u4',
  'zepto':  'zp_api_gigshield_q1w2e3r4t5y6',
};

const authenticateApiKey = (platform) => (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const partnerKey = req.headers['x-partner-id'];

  if (!apiKey) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing x-api-key header',
      docs: `https://developer.${platform}.com/authentication`,
    });
  }

  if (apiKey !== MOCK_API_KEYS[platform]) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Invalid API key',
      hint: 'Ensure you are using the correct key for this environment',
    });
  }

  req.platform = platform;
  req.partnerId = partnerKey || 'gigshield';
  next();
};

// Rate limit simulation
const rateLimitTracker = {};
const rateLimit = (req, res, next) => {
  const key = req.headers['x-api-key'];
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100;

  if (!rateLimitTracker[key]) rateLimitTracker[key] = [];
  rateLimitTracker[key] = rateLimitTracker[key].filter(t => now - t < windowMs);

  if (rateLimitTracker[key].length >= maxRequests) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Max ${maxRequests} requests per minute`,
      retry_after: Math.ceil((rateLimitTracker[key][0] + windowMs - now) / 1000),
    });
  }

  rateLimitTracker[key].push(now);

  // Set rate limit headers like real APIs do
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - rateLimitTracker[key].length);
  next();
};

module.exports = { authenticateApiKey, rateLimit };