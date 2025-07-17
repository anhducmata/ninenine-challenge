# ADR-007: Rate Limiting Strategy

## Status
Accepted

## Date
2025-07-17

## Context
The live scoreboard system must prevent abuse and ensure fair play by limiting how frequently users can submit score updates. Without proper rate limiting, malicious users could flood the system with requests or attempt to gain unfair advantages through rapid score submissions.

## Decision
We have decided to implement a multi-layered rate limiting strategy using token bucket algorithm with Redis as the backing store, combined with application-level business logic limits.

## Rationale
1. **Abuse Prevention**: Prevents rapid-fire score update attempts
2. **System Protection**: Protects backend services from overload
3. **Fair Play**: Ensures all users have equal opportunity
4. **Resource Management**: Prevents single users from consuming excessive resources
5. **Security Layer**: Additional protection against automated attacks
6. **Scalability**: Redis-backed solution scales across multiple API instances

## Consequences

### Positive
- Effective protection against abuse and gaming attempts
- System stability under high load conditions
- Fair user experience for all participants
- Reduced infrastructure costs from abuse prevention
- Additional security layer against automated attacks
- Flexible rate limiting rules for different user types

### Negative
- Additional complexity in request processing
- Potential user frustration with legitimate rapid actions
- Redis dependency for rate limiting state
- Need for careful tuning of rate limit parameters
- Error handling complexity for rate limit violations

## Technical Implementation

### Rate Limiting Layers

#### Layer 1: Global Rate Limiting
```python
# Global limits per IP address
GLOBAL_LIMITS = {
    "requests_per_minute": 300,
    "requests_per_hour": 1000,
    "requests_per_day": 10000
}

# Global limits per user
USER_GLOBAL_LIMITS = {
    "requests_per_minute": 60,
    "requests_per_hour": 500,
    "requests_per_day": 2000
}
```

#### Layer 2: Action-Specific Rate Limiting
```python
# Score update specific limits
SCORE_UPDATE_LIMITS = {
    "actions_per_minute": 10,
    "actions_per_hour": 100,
    "actions_per_day": 500,
    "min_interval_seconds": 3  # Minimum time between actions
}

# Different limits for different action types
ACTION_TYPE_LIMITS = {
    "puzzle_complete": {"per_minute": 5, "per_hour": 50},
    "game_finish": {"per_minute": 3, "per_hour": 30},
    "challenge_complete": {"per_minute": 2, "per_hour": 20}
}
```

#### Layer 3: User Tier-Based Limits
```python
# Premium users get higher limits
USER_TIER_MULTIPLIERS = {
    "free": 1.0,
    "premium": 2.0,
    "vip": 3.0
}
```

### Token Bucket Algorithm Implementation
```python
import redis
import time
import json

class TokenBucketRateLimiter:
    def __init__(self, redis_client, bucket_size, refill_rate):
        self.redis = redis_client
        self.bucket_size = bucket_size
        self.refill_rate = refill_rate  # tokens per second
    
    def is_allowed(self, key, tokens_requested=1):
        current_time = time.time()
        
        # Get current bucket state
        bucket_data = self.redis.get(f"bucket:{key}")
        if bucket_data:
            bucket = json.loads(bucket_data)
            last_refill = bucket["last_refill"]
            current_tokens = bucket["tokens"]
        else:
            last_refill = current_time
            current_tokens = self.bucket_size
        
        # Calculate tokens to add based on time elapsed
        time_elapsed = current_time - last_refill
        tokens_to_add = time_elapsed * self.refill_rate
        current_tokens = min(self.bucket_size, current_tokens + tokens_to_add)
        
        # Check if request can be satisfied
        if current_tokens >= tokens_requested:
            current_tokens -= tokens_requested
            allowed = True
        else:
            allowed = False
        
        # Update bucket state
        bucket_data = {
            "tokens": current_tokens,
            "last_refill": current_time
        }
        self.redis.setex(f"bucket:{key}", 3600, json.dumps(bucket_data))
        
        return allowed, current_tokens
```

### Redis Rate Limiting Keys
```python
# Rate limiting key patterns
def get_rate_limit_keys(user_id, ip_address, action_type):
    return {
        "user_global": f"rate_limit:user:{user_id}:global",
        "user_action": f"rate_limit:user:{user_id}:action:{action_type}",
        "ip_global": f"rate_limit:ip:{ip_address}:global",
        "user_daily": f"rate_limit:user:{user_id}:daily",
        "action_interval": f"rate_limit:user:{user_id}:interval"
    }
```

### Rate Limiting Middleware
```python
async def rate_limit_middleware(request, user_id, action_type):
    ip_address = get_client_ip(request)
    keys = get_rate_limit_keys(user_id, ip_address, action_type)
    
    # Check global IP rate limit
    if not check_ip_rate_limit(ip_address):
        raise RateLimitExceeded("IP rate limit exceeded", retry_after=60)
    
    # Check user global rate limit
    if not check_user_global_rate_limit(user_id):
        raise RateLimitExceeded("User rate limit exceeded", retry_after=60)
    
    # Check action-specific rate limit
    if not check_action_rate_limit(user_id, action_type):
        raise RateLimitExceeded("Action rate limit exceeded", retry_after=30)
    
    # Check minimum interval between actions
    if not check_minimum_interval(user_id):
        raise RateLimitExceeded("Too frequent actions", retry_after=3)
    
    return True
```

## Advanced Features

### Adaptive Rate Limiting
```python
# Adjust limits based on user behavior
def get_adaptive_limits(user_id):
    user_stats = get_user_statistics(user_id)
    
    # Reduce limits for users with suspicious patterns
    if user_stats["security_incidents"] > 3:
        return apply_multiplier(SCORE_UPDATE_LIMITS, 0.5)
    
    # Increase limits for verified good users
    if user_stats["account_age_days"] > 30 and user_stats["violations"] == 0:
        return apply_multiplier(SCORE_UPDATE_LIMITS, 1.5)
    
    return SCORE_UPDATE_LIMITS
```

### Geographic Rate Limiting
```python
# Different limits based on geographic regions
GEOGRAPHIC_MULTIPLIERS = {
    "US": 1.0,
    "EU": 1.0,
    "APAC": 0.8,  # Adjust for different usage patterns
    "OTHER": 0.6
}
```

## Error Handling and User Experience

### Rate Limit Response Format
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please wait before trying again.",
  "retry_after": 30,
  "limit_type": "action_rate_limit",
  "current_usage": {
    "actions_this_minute": 10,
    "actions_this_hour": 85,
    "limit_minute": 10,
    "limit_hour": 100
  }
}
```

### Client-Side Handling
```javascript
// Client-side rate limit handling
function handleRateLimit(response) {
    const retryAfter = response.retry_after;
    
    // Show user-friendly message
    showNotification(`Please wait ${retryAfter} seconds before trying again`, 'warning');
    
    // Disable action buttons temporarily
    disableActionButtons(retryAfter * 1000);
    
    // Show countdown timer
    startCountdownTimer(retryAfter);
}
```

## Monitoring and Alerting

### Key Metrics
- Rate limit violation frequency by user and IP
- Average time between user actions
- Peak request rates during high activity periods
- Rate limit effectiveness (reduction in abuse attempts)

### Alerting Thresholds
```python
ALERT_THRESHOLDS = {
    "high_violation_rate": 100,  # violations per minute
    "suspicious_user_pattern": 50,  # violations per user per hour
    "system_overload": 1000,  # total requests per second
    "redis_connection_issues": 5  # failed Redis operations per minute
}
```

### Dashboard Metrics
- Real-time rate limit violation counts
- Top violating users and IP addresses
- Rate limit effectiveness metrics
- System performance under rate limiting

## Configuration Management

### Environment-Based Limits
```yaml
# Production limits
production:
  score_updates:
    per_minute: 10
    per_hour: 100
    min_interval: 3

# Development limits (more relaxed)
development:
  score_updates:
    per_minute: 50
    per_hour: 500
    min_interval: 1
```

### Dynamic Configuration
- Hot-reload rate limit configurations without deployment
- A/B testing different rate limit strategies
- Emergency rate limit adjustments during attacks

## Testing Strategy

### Load Testing
- Simulate high concurrent user loads
- Test rate limiting under stress conditions
- Verify rate limit accuracy under load

### Security Testing
- Attempt various bypass techniques
- Test with automated scripts and bots
- Verify rate limiting effectiveness against attacks

### User Experience Testing
- Test legitimate user workflows
- Ensure rate limits don't impact normal usage
- Validate error messages and user feedback

## Alternatives Considered
1. **Application-Level Counters**: Simpler but doesn't scale across instances
2. **Database-Based Rate Limiting**: Too slow for high-frequency checks
3. **Third-Party Services**: External dependency and additional cost
4. **Fixed Window Counters**: Less smooth than token bucket approach
5. **Leaky Bucket Algorithm**: More complex implementation

## Future Enhancements
1. **Machine Learning**: Adaptive rate limiting based on user behavior patterns
2. **Geographic Intelligence**: Location-based rate limiting adjustments
3. **Reputation System**: User reputation affects rate limits
4. **Advanced Analytics**: Detailed rate limiting analytics and insights
