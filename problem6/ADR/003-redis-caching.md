# ADR-003: Redis for Caching Layer

## Status
Accepted

## Date
2025-07-17

## Context
The live scoreboard system needs to serve leaderboard data quickly to many concurrent users while maintaining reasonable database load. The top 10 scores are frequently requested but don't change constantly.

## Decision
We have decided to use Redis as the primary caching layer for leaderboard data and other frequently accessed information.

## Rationale
1. **Performance**: Sub-millisecond response times for cached data
2. **Scalability**: Reduces database load significantly
3. **Memory Efficiency**: Optimized for in-memory operations
4. **Data Structures**: Rich data types suitable for leaderboards
5. **Persistence**: Optional persistence for cache recovery
6. **Clustering**: Built-in clustering for high availability
7. **Pub/Sub**: Additional real-time messaging capabilities

## Consequences

### Positive
- Dramatically improved response times for leaderboard queries
- Reduced database load and cost
- Better user experience with faster page loads
- Scalable to handle high concurrent user loads
- Cache invalidation strategies prevent stale data
- Additional features like pub/sub for real-time updates

### Negative
- Additional infrastructure component to manage
- Memory costs for caching layer
- Cache consistency challenges
- Potential single point of failure without clustering
- Cache warming strategies needed for cold starts

## Caching Strategy
1. **Cache Keys**: 
   - `top_10_scores`: Global leaderboard
   - `user_rank:{user_id}`: Individual user rankings
   - `user_score:{user_id}`: Individual user scores

2. **TTL Strategy**:
   - Leaderboard data: 60 seconds
   - User-specific data: 300 seconds
   - Authentication data: 900 seconds

3. **Invalidation**:
   - Write-through on score updates
   - Selective invalidation for affected users
   - Bulk invalidation for leaderboard changes

## Implementation Details
```python
# Cache key patterns
LEADERBOARD_KEY = "top_10_scores"
USER_RANK_KEY = "user_rank:{user_id}"
USER_SCORE_KEY = "user_score:{user_id}"

# TTL values
LEADERBOARD_TTL = 60  # seconds
USER_DATA_TTL = 300   # seconds
AUTH_DATA_TTL = 900   # seconds
```

## High Availability
- Redis Sentinel for automatic failover
- Master-slave replication for read scaling
- Clustering for horizontal scaling
- Regular backups for disaster recovery

## Monitoring
- Cache hit/miss ratios
- Memory usage and eviction rates
- Response times and throughput
- Replication lag monitoring
- Connection pool metrics

## Alternatives Considered
1. **Memcached**: Simpler but less feature-rich
2. **Database Query Optimization**: Not sufficient for our scale
3. **Application-Level Caching**: Doesn't scale across instances
4. **CDN Caching**: Not suitable for dynamic, user-specific data

## Security Considerations
- Network isolation and VPC configuration
- Authentication for Redis access
- Encryption in transit for sensitive data
- Regular security updates and patches
