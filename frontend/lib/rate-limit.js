// In-memory store for rate limits (replace with Redis in production)
const rateLimitStore = new Map();

const OPERATION_WEIGHTS = {
  updatePixel: 1,    // Costs 1 point
  getPixelGrid: 0.1  // Costs 0.1 points
};

export async function rateLimit(userId, limits, operation) {
  const now = Date.now();
  const hourAgo = now - 3600000; // 1 hour in milliseconds
  
  // Get or initialize user's rate limit data
  let userData = rateLimitStore.get(userId);
  if (!userData) {
    userData = {
      operations: [],
      points: 0
    };
    rateLimitStore.set(userId, userData);
  }

  // Clean up old operations
  userData.operations = userData.operations.filter(op => op.timestamp > hourAgo);
  
  // Recalculate points
  userData.points = userData.operations.reduce((sum, op) => 
    sum + (OPERATION_WEIGHTS[op.type] || 1), 0
  );

  // Get operation weight
  const weight = OPERATION_WEIGHTS[operation] || 1;

  // Check if operation would exceed limit
  if (userData.points + weight > limits.updates) {
    return {
      success: false,
      limit: limits.updates,
      remaining: Math.max(0, limits.updates - userData.points)
    };
  }

  // Record new operation
  userData.operations.push({
    timestamp: now,
    type: operation
  });
  userData.points += weight;

  return {
    success: true,
    limit: limits.updates,
    remaining: limits.updates - userData.points
  };
} 