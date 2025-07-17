# Live Scoreboard System - API Module Specification

## Overview

This document provides a comprehensive specification for the Live Scoreboard API module, designed to support real-time score updates, secure score validation, and live leaderboard broadcasting. The system ensures data integrity, prevents score manipulation, and provides a seamless user experience with live updates.

> **📋 Architecture Decisions**: For detailed reasoning behind technical choices, see our [Architecture Decision Records (ADR)](./ADR/README.md) which document key architectural decisions and their rationale.

## System Architecture

The Live Scoreboard system consists of several interconnected components working together to provide a secure and real-time experience:

### Core Components

1. **Frontend Application** - User interface and client-side logic
2. **API Server** (Main focus) - Core business logic and score management
3. **Auth Service** - Authentication and authorization
4. **Database** - Persistent data storage
5. **WebSocket Server** - Real-time communication
6. **Redis Cache** - High-performance caching layer

## Detailed Flow Documentation

### Phase 1: Authentication Flow

**Purpose**: Secure user authentication before accessing scoreboard features.

**Process**:
1. User navigates to the website and is presented with a login page
2. User submits credentials (username/password)
3. Frontend sends authentication request to Auth Service
4. Auth Service validates credentials against database using bcrypt hashing
5. Upon successful validation, JWT token is generated and returned
6. Frontend stores JWT token in localStorage for subsequent requests

**Security Considerations**:
- Passwords are hashed using bcrypt for secure storage
- JWT tokens provide stateless authentication
- Login timestamps are tracked for security auditing

### Phase 2: Initial Scoreboard Load

**Purpose**: Display current leaderboard state when user accesses the dashboard.

**Process**:
1. Frontend requests scoreboard data with JWT authentication
2. API Server validates the JWT token with Auth Service
3. API Server checks Redis cache for "top_10_scores" key
4. If cache miss, queries database for top 10 users by score
5. Results are cached in Redis with 60-second TTL
6. Response includes top 10 leaderboard, user's current score, and rank

**Performance Optimizations**:
- Redis caching reduces database load
- Short TTL (60s) ensures relatively fresh data
- Single query returns user's position and top scores

### Phase 3: WebSocket Connection Establishment

**Purpose**: Enable real-time updates for live scoreboard functionality.

**Process**:
1. Frontend establishes WebSocket connection with JWT in headers
2. WebSocket Server validates JWT token with Auth Service
3. User is added to active connections pool
4. Connection established event confirms successful setup
5. Frontend displays live connection indicator

**Benefits**:
- Real-time bidirectional communication
- Efficient broadcasting to multiple users
- Connection state management for reliability

### Phase 4: User Action Processing

**Purpose**: Capture and prepare user actions for score updates.

**Process**:
1. User completes an action (game, task, puzzle, etc.)
2. Frontend performs local validation and generates action proof
3. Action proof includes: action type, timestamp, action data, client signature, expected points
4. Secure API call is made to update score

**Security Features**:
- Client-side proof generation prevents tampering
- Cryptographic signatures ensure authenticity
- Timestamp inclusion prevents replay attacks

### Phase 5: Security Validation (Critical Component)

**Purpose**: Comprehensive security checks to prevent score manipulation.

**Validation Checks**:
- **JWT Token Validation**: Ensures authenticated user
- **Timestamp Freshness**: Actions must be within 30 seconds
- **Signature Verification**: Cryptographic proof of action authenticity
- **Rate Limiting**: Prevents rapid-fire score increases
- **Duplicate Detection**: Ensures actions aren't processed multiple times
- **Score Reasonableness**: Validates score increment matches action type
- **User Permissions**: Verifies user has rights to perform action

**Security Response**:
- Invalid requests are logged for security monitoring
- Different error codes for different failure types
- Potential account flagging for suspicious activity

### Phase 6: Score Update Transaction

**Purpose**: Atomically update user score and maintain audit trail.

**Database Operations**:
1. Begin database transaction
2. Update user's score with calculated increment
3. Insert record into score_history for audit trail
4. Commit transaction if all operations succeed
5. Return new score value

**ACID Compliance**:
- Atomic: All operations succeed or fail together
- Consistent: Database constraints maintained
- Isolated: Concurrent updates don't interfere
- Durable: Changes are permanently stored

### Phase 7: Cache Management

**Purpose**: Maintain cache consistency after score updates.

**Process**:
1. Invalidate existing "top_10_scores" cache entry
2. Query database for updated top 10 leaderboard
3. Store fresh data in Redis cache
4. Prepare data for broadcasting

**Cache Strategy**:
- Write-through pattern ensures consistency
- Short TTL balances performance and freshness
- Selective invalidation minimizes cache churn

### Phase 8: User Response

**Purpose**: Provide immediate feedback to the acting user.

**Response Data**:
- Success confirmation
- New score value
- Updated rank position
- User-friendly success notification

### Phase 9: Live Broadcasting

**Purpose**: Update all connected users with real-time scoreboard changes.

**Broadcasting Process**:
1. API Server sends broadcast request to WebSocket Server
2. Broadcast data includes updated top 10 and changed user info
3. WebSocket Server emits updates to all connected clients
4. Frontend updates display with smooth animations

**Real-time Features**:
- Immediate updates across all connected users
- Smooth UI animations for better user experience
- Efficient broadcast to minimize server load

## Error Handling Scenarios

### Authentication Errors
- **Invalid JWT Token**: Redirect to login page
- **Expired Token**: Automatic token refresh or re-authentication

### Validation Errors
- **Action Validation Fails**: Clear error message to user
- **Rate Limit Exceeded**: Temporary cooldown with countdown timer
- **Score Manipulation Detected**: Account flagging and investigation

### System Errors
- **Database Transaction Fails**: Graceful error handling with retry option
- **WebSocket Connection Lost**: Automatic reconnection with status indicator
- **Concurrent Updates**: Optimistic locking with retry mechanism

### Security Incidents
- **Malicious Action Proof**: Security logging and potential account suspension
- **Replay Attack**: Prevention through timestamp and action tracking
- **Score Manipulation Attempt**: Comprehensive logging and investigation

## API Endpoints Specification

### GET /api/scoreboard
**Purpose**: Retrieve current leaderboard data

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Response**:
```json
{
  "top10": [
    {"id": 1, "username": "player1", "score": 9500},
    {"id": 2, "username": "player2", "score": 9200}
  ],
  "userScore": 7800,
  "userRank": 15
}
```

### POST /api/score/update
**Purpose**: Process score update with security validation

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "action_proof": {
    "action_type": "puzzle_complete",
    "timestamp": "2025-07-17T10:30:00Z",
    "action_data": {...},
    "client_signature": "abc123...",
    "expected_points": 100
  },
  "timestamp": "2025-07-17T10:30:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "new_score": 7900,
  "new_rank": 14,
  "points_added": 100
}
```

### POST /broadcast/score-update
**Purpose**: Internal endpoint for broadcasting updates

**Request Body**:
```json
{
  "type": "score_update",
  "top_10": [...],
  "updated_user": {
    "id": 1,
    "username": "player1",
    "score": 9600
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  score INTEGER DEFAULT 0,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  permissions JSON
);

CREATE INDEX idx_users_score ON users(score DESC);
CREATE INDEX idx_users_username ON users(username);
```

### Score History Table
```sql
CREATE TABLE score_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  points_added INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  action_data JSON
);

CREATE INDEX idx_score_history_user_timestamp ON score_history(user_id, timestamp);
```

### Security Incidents Table
```sql
CREATE TABLE security_incidents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  incident_type VARCHAR(50) NOT NULL,
  details JSON,
  timestamp TIMESTAMP DEFAULT NOW(),
  ip_address INET
);
```

## Security Measures

### Authentication Security
- JWT tokens with reasonable expiration times
- Secure password hashing with bcrypt
- Session management and token validation

### Action Validation Security
- Cryptographic signatures for action authenticity
- Timestamp-based replay attack prevention
- Rate limiting to prevent abuse
- Comprehensive input validation

### Data Security
- Database transactions for consistency
- Audit trails for all score changes
- Security incident logging
- SQL injection prevention through parameterized queries

### Network Security
- HTTPS enforcement for all API calls
- WebSocket Secure (WSS) for real-time connections
- CORS configuration for frontend security

## Performance Considerations

### Caching Strategy
- Redis for frequently accessed leaderboard data
- Short TTL to balance performance and accuracy
- Cache invalidation on score updates

### Database Optimization
- Proper indexing on score and user fields
- Efficient queries for top 10 retrieval
- Connection pooling for concurrent access

### Real-time Performance
- Efficient WebSocket connection management
- Selective broadcasting to reduce network load
- Client-side caching for improved responsiveness

## Monitoring and Observability

### Key Metrics
- API response times
- Authentication success/failure rates
- Score update frequency
- WebSocket connection stability
- Cache hit/miss ratios

### Logging
- All score updates with full audit trail
- Security incidents and attempted violations
- Performance metrics and errors
- User activity patterns

### Alerting
- Unusual score update patterns
- Security violation attempts
- System performance degradation
- Database transaction failures

## Deployment Architecture

### Infrastructure Components
- Load balancer for API server scaling
- Redis cluster for cache high availability
- Database replication for read scalability
- WebSocket server cluster for connection distribution

### Scaling Considerations
- Horizontal scaling of API servers
- Database read replicas for query distribution
- Redis clustering for cache scalability
- CDN for static asset delivery

## Improvements and Recommendations

### Security Enhancements
1. **Multi-Factor Authentication**: Add 2FA for high-value accounts
2. **Advanced Rate Limiting**: Implement adaptive rate limiting based on user behavior
3. **Machine Learning Fraud Detection**: Detect unusual scoring patterns
4. **IP-based Restrictions**: Block suspicious IP addresses automatically

### Performance Optimizations
1. **Database Sharding**: Distribute users across multiple database shards
2. **Advanced Caching**: Implement multi-level caching strategy
3. **Real-time Optimization**: Use WebSocket connection pooling and message queuing
4. **CDN Integration**: Cache static leaderboard data at edge locations

### Feature Enhancements
1. **Historical Analytics**: Provide detailed score history and trends
2. **Achievement System**: Award badges and achievements for milestones
3. **Social Features**: Friends, teams, and social leaderboards
4. **Mobile Optimization**: Native mobile app support with push notifications

### Operational Improvements
1. **Blue-Green Deployment**: Zero-downtime deployments
2. **Circuit Breakers**: Prevent cascade failures
3. **Health Checks**: Comprehensive system health monitoring
4. **Automated Testing**: Full integration and load testing suites

### Compliance and Governance
1. **Data Privacy**: GDPR compliance for user data
2. **Audit Compliance**: Comprehensive audit trails
3. **Disaster Recovery**: Regular backups and recovery procedures
4. **Security Audits**: Regular penetration testing and security reviews

## Testing Strategy

### Unit Testing
- Individual component testing for all API endpoints
- Security validation logic testing
- Database transaction testing

### Integration Testing
- End-to-end flow testing
- WebSocket connection testing
- Cache integration testing

### Load Testing
- Concurrent user simulation
- WebSocket connection stress testing
- Database performance under load

### Security Testing
- Penetration testing for vulnerabilities
- Authentication bypass attempts
- Score manipulation testing

## Related Documentation

- **[Architecture Decision Records (ADR)](./ADR/README.md)** - Detailed documentation of technical decisions and their rationale
- **[System Flow Diagram](./c4-diagram.md)** - Complete sequence diagram showing all system interactions
- **Individual ADRs**:
  - [Microservices Architecture](./ADR/001-microservices-architecture.md)
  - [JWT Authentication](./ADR/002-jwt-authentication.md)
  - [Redis Caching](./ADR/003-redis-caching.md)
  - [WebSocket Real-time Communication](./ADR/004-websockets-realtime.md)
  - [Cryptographic Action Proofs](./ADR/005-cryptographic-action-proofs.md)
  - [PostgreSQL Database](./ADR/006-postgresql-database.md)
  - [Rate Limiting Strategy](./ADR/007-rate-limiting-strategy.md)

## Conclusion

This Live Scoreboard API module provides a robust, secure, and scalable solution for real-time score management. The architecture emphasizes security through multiple validation layers, performance through intelligent caching, and user experience through real-time updates. The comprehensive error handling and monitoring ensure system reliability and maintainability.

The implementation team should prioritize security validation, implement proper testing coverage, and ensure monitoring is in place before production deployment. Regular security audits and performance monitoring will help maintain system integrity and optimal user experience.
