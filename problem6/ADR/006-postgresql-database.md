# ADR-006: PostgreSQL for Primary Database

## Status
Accepted

## Date
2025-07-17

## Context
The live scoreboard system requires a robust, scalable database that can handle concurrent score updates, maintain data consistency, and provide good performance for leaderboard queries. The system needs ACID transactions for score updates and efficient querying for rankings.

## Decision
We have decided to use PostgreSQL as the primary database for the live scoreboard system.

## Rationale
1. **ACID Compliance**: Full transaction support for consistent score updates
2. **Performance**: Excellent performance for both reads and writes
3. **Scalability**: Supports read replicas and horizontal scaling options
4. **JSON Support**: Native JSON data types for flexible action data storage
5. **Advanced Indexing**: Supports various index types for optimal query performance
6. **Mature Ecosystem**: Well-established with extensive tooling and community support
7. **Security Features**: Row-level security, encryption, and comprehensive access controls

## Consequences

### Positive
- Strong consistency guarantees for financial-like score data
- Excellent performance for complex queries and aggregations
- Rich indexing options for leaderboard queries
- JSON support for flexible action data storage
- Mature replication and backup solutions
- Strong security and compliance features
- Extensive monitoring and optimization tools

### Negative
- More complex setup and maintenance than NoSQL alternatives
- Vertical scaling limitations (though horizontal options exist)
- Resource intensive for very high write loads
- Requires careful schema design and migration planning
- Learning curve for advanced features and optimization

## Schema Design

### Core Tables
```sql
-- Users table with score tracking
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  score INTEGER DEFAULT 0 NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true
);

-- Score history for audit trail
CREATE TABLE score_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  points_added INTEGER NOT NULL,
  action_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  proof_signature VARCHAR(255),
  ip_address INET
);

-- Security incidents tracking
CREATE TABLE security_incidents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  incident_type VARCHAR(50) NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  resolved BOOLEAN DEFAULT false
);

-- Action nonces for replay prevention
CREATE TABLE action_nonces (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  nonce VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, nonce)
);
```

### Optimized Indexes
```sql
-- Performance indexes
CREATE INDEX idx_users_score_desc ON users(score DESC, id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active_score ON users(score DESC) WHERE is_active = true;

CREATE INDEX idx_score_history_user_time ON score_history(user_id, timestamp DESC);
CREATE INDEX idx_score_history_timestamp ON score_history(timestamp DESC);
CREATE INDEX idx_score_history_action_type ON score_history(action_type);

CREATE INDEX idx_security_incidents_user ON security_incidents(user_id, timestamp DESC);
CREATE INDEX idx_security_incidents_type ON security_incidents(incident_type, timestamp DESC);

CREATE INDEX idx_action_nonces_user_created ON action_nonces(user_id, created_at);
CREATE INDEX idx_action_nonces_cleanup ON action_nonces(created_at) WHERE created_at < NOW() - INTERVAL '1 hour';
```

## Performance Optimization

### Query Optimization
```sql
-- Optimized leaderboard query
SELECT id, username, score, 
       ROW_NUMBER() OVER (ORDER BY score DESC, id ASC) as rank
FROM users 
WHERE is_active = true 
ORDER BY score DESC, id ASC 
LIMIT 10;

-- User rank calculation
WITH user_rank AS (
  SELECT id, score,
         ROW_NUMBER() OVER (ORDER BY score DESC, id ASC) as rank
  FROM users 
  WHERE is_active = true
)
SELECT rank FROM user_rank WHERE id = $1;
```

### Connection Pooling
- Use connection pooling (PgBouncer) for efficient connection management
- Configure appropriate pool sizes based on concurrent load
- Monitor connection usage and adjust pool settings

### Read Replicas
- Set up read replicas for leaderboard queries
- Route read-only queries to replicas
- Use primary database only for writes and critical reads

## High Availability and Backup

### Replication Strategy
- Primary-replica setup with automatic failover
- Streaming replication for minimal lag
- Regular backup scheduling (daily full, hourly incremental)
- Point-in-time recovery capability

### Monitoring
- Query performance monitoring with pg_stat_statements
- Connection and resource usage tracking
- Replication lag monitoring
- Automated alerting for performance issues

## Security Configuration

### Access Control
```sql
-- Database roles and permissions
CREATE ROLE scoreboard_api;
GRANT SELECT, INSERT, UPDATE ON users TO scoreboard_api;
GRANT SELECT, INSERT ON score_history TO scoreboard_api;
GRANT ALL ON action_nonces TO scoreboard_api;

CREATE ROLE scoreboard_readonly;
GRANT SELECT ON users, score_history TO scoreboard_readonly;
```

### Security Features
- SSL/TLS encryption for all connections
- Row-level security for multi-tenant scenarios
- Regular security updates and patches
- Database activity monitoring and logging

## Data Retention and Cleanup

### Cleanup Jobs
```sql
-- Clean up old nonces (run hourly)
DELETE FROM action_nonces 
WHERE created_at < NOW() - INTERVAL '1 hour';

-- Archive old score history (run monthly)
-- Move records older than 1 year to archive table
```

### Data Archiving
- Implement data archiving for old score history
- Maintain performance while preserving audit trail
- Regular cleanup of temporary data (nonces, sessions)

## Alternatives Considered
1. **MySQL**: Good performance but less advanced features
2. **MongoDB**: NoSQL flexibility but lacks ACID guarantees
3. **Redis**: Excellent performance but primarily in-memory
4. **CockroachDB**: Distributed SQL but adds complexity
5. **Amazon RDS**: Managed service but vendor lock-in

## Migration Strategy
- Schema versioning with migration scripts
- Zero-downtime migration procedures
- Rollback procedures for failed migrations
- Testing migrations in staging environment

## Monitoring and Alerting
- Query performance monitoring
- Database size and growth tracking
- Connection pool utilization
- Replication lag and availability monitoring
- Automated backup verification
