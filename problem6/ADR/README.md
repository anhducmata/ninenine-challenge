# Architecture Decision Records (ADR) Index

This directory contains Architecture Decision Records (ADRs) that document the key technical decisions made for the Live Scoreboard System. Each ADR follows a standard format explaining the context, decision, rationale, and consequences of architectural choices.

## ADR Format
Each ADR includes:
- **Status**: Current status (Proposed, Accepted, Deprecated, Superseded)
- **Date**: When the decision was made
- **Context**: The situation that led to the need for a decision
- **Decision**: The specific choice that was made
- **Rationale**: Why this decision was made
- **Consequences**: Positive and negative impacts of the decision
- **Alternatives Considered**: Other options that were evaluated

## Current ADRs

### [ADR-001: Microservices Architecture](./001-microservices-architecture.md)
**Status**: Accepted  
**Summary**: Decision to implement a microservices architecture with separate services for API, Authentication, WebSocket communication, Database, and Redis Cache.

**Key Points**:
- Separation of concerns and independent scaling
- Better fault tolerance and system resilience
- Technology diversity for optimal tool selection
- Increased system complexity as trade-off

### [ADR-002: JWT Tokens for Authentication](./002-jwt-authentication.md)
**Status**: Accepted  
**Summary**: Use JWT (JSON Web Tokens) for stateless authentication across all services.

**Key Points**:
- Stateless authentication for better scalability
- Cross-service compatibility without database lookups
- Token-based security with refresh mechanisms
- Challenge with token revocation addressed through expiration and blacklists

### [ADR-003: Redis for Caching Layer](./003-redis-caching.md)
**Status**: Accepted  
**Summary**: Implementation of Redis as the primary caching layer for leaderboard data and frequently accessed information.

**Key Points**:
- Sub-millisecond response times for cached data
- Significant reduction in database load
- Write-through caching strategy with TTL management
- High availability through clustering and replication

### [ADR-004: WebSockets for Real-time Communication](./004-websockets-realtime.md)
**Status**: Accepted  
**Summary**: Use WebSockets for real-time bidirectional communication between server and clients.

**Key Points**:
- Instant real-time updates without polling overhead
- Efficient bandwidth usage and low latency
- Persistent connection management with heartbeat monitoring
- Scalability through connection pooling and load balancing

### [ADR-005: Cryptographic Action Proofs for Security](./005-cryptographic-action-proofs.md)
**Status**: Accepted  
**Summary**: Implementation of cryptographic action proofs to prevent score manipulation and ensure action authenticity.

**Key Points**:
- HMAC signatures for tamper-proof action validation
- Timestamp and nonce-based replay attack prevention
- Client-side proof generation with server-side verification
- Comprehensive security validation framework

### [ADR-006: PostgreSQL for Primary Database](./006-postgresql-database.md)
**Status**: Accepted  
**Summary**: Use PostgreSQL as the primary database for its ACID compliance, performance, and advanced features.

**Key Points**:
- Full ACID transaction support for score consistency
- Advanced indexing and JSON support for flexible schemas
- Mature ecosystem with excellent tooling
- High availability through replication and backup strategies

### [ADR-007: Rate Limiting Strategy](./007-rate-limiting-strategy.md)
**Status**: Accepted  
**Summary**: Multi-layered rate limiting using token bucket algorithm with Redis backing store.

**Key Points**:
- Token bucket algorithm for smooth rate limiting
- Multi-layer approach (global, user, action-specific)
- Redis-backed solution for distributed rate limiting
- Adaptive limits based on user behavior and tier

## Decision Timeline

```
2025-07-17: ADR-001 through ADR-007 - Initial architecture decisions
```

## How to Use This Documentation

### For Developers
- Review relevant ADRs before implementing features
- Understand the reasoning behind architectural choices
- Follow established patterns and decisions
- Propose new ADRs for significant architectural changes

### For System Architects
- Use as reference for system design decisions
- Update ADRs when decisions change or evolve
- Ensure new decisions align with existing architecture
- Document trade-offs and alternative approaches

### For Operations Teams
- Understand infrastructure requirements and dependencies
- Use monitoring and alerting recommendations
- Follow deployment and scaling guidelines
- Implement security measures as documented

## Creating New ADRs

When making new architectural decisions:

1. **Create a new ADR file** following the naming convention: `XXX-short-description.md`
2. **Use the standard format** with Status, Date, Context, Decision, Rationale, and Consequences
3. **Consider alternatives** and document why they were not chosen
4. **Update this index** with the new ADR summary
5. **Reference related ADRs** when decisions are connected

## ADR Status Definitions

- **Proposed**: Decision is under consideration
- **Accepted**: Decision has been made and is being implemented
- **Deprecated**: Decision is no longer recommended but may still be in use
- **Superseded**: Decision has been replaced by a newer ADR

## Related Documentation

- [Main README](../README.md) - Complete system specification
- [System Architecture Diagram](../c4-diagram.md) - Visual system overview
- [API Documentation](../README.md#api-endpoints-specification) - Detailed API specifications

## Contributing

When proposing changes to architectural decisions:
1. Create a new ADR proposing the change
2. Reference the original ADR being modified
3. Clearly explain the motivation for change
4. Document migration strategy if applicable
5. Update related documentation and diagrams
