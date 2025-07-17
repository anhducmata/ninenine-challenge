title Live Scoreboard System - Complete Flow

participant User
participant Frontend
participant Auth Service
participant API Server
participant Database
participant WebSocket Server
participant Redis Cache
participant Other Users

# === PHASE 1: AUTHENTICATION ===
User -> Frontend: 1. Navigate to website
Frontend -> User: 2. Show login page
User -> Frontend: 3. Enter credentials (username, password)
Frontend -> Auth Service: 4. POST /auth/login {username, password}
Auth Service -> Database: 5. SELECT user WHERE username = ?
Database -> Auth Service: 6. Return user data + password hash
Auth Service -> Auth Service: 7. Verify password using bcrypt
Auth Service -> Database: 8. UPDATE last_login = NOW()
Database -> Auth Service: 9. Login timestamp updated
Auth Service -> Frontend: 10. Return JWT token + user profile
Frontend -> Frontend: 11. Store JWT in localStorage
Frontend -> User: 12. Redirect to dashboard

# === PHASE 2: INITIAL SCOREBOARD LOAD ===
Frontend -> API Server: 13. GET /api/scoreboard (Authorization: Bearer JWT)
API Server -> Auth Service: 14. Validate JWT token
Auth Service -> API Server: 15. Token valid + user claims
API Server -> Redis Cache: 16. GET "top_10_scores"
Redis Cache -> API Server: 17. Cache miss (or expired data)
API Server -> Database: 18. SELECT TOP 10 * FROM users ORDER BY score DESC
Database -> API Server: 19. Return top 10 users {id, username, score}
API Server -> Redis Cache: 20. SET "top_10_scores" (TTL: 60 seconds)
API Server -> Frontend: 21. Return {top10: [...], userScore: X, userRank: Y}
Frontend -> User: 22. Display current leaderboard

# === PHASE 3: WEBSOCKET CONNECTION ===
Frontend -> WebSocket Server: 23. Connect with JWT in headers
WebSocket Server -> Auth Service: 24. Validate JWT token
Auth Service -> WebSocket Server: 25. Token valid + user_id
WebSocket Server -> WebSocket Server: 26. Add user to connections pool
WebSocket Server -> Frontend: 27. Connection established event
Frontend -> Frontend: 28. Set connection status = "Live"
Frontend -> User: 29. Show "🟢 Live" indicator

# === PHASE 4: USER ACTION ===
User -> Frontend: 30. Perform action (complete game/task/puzzle)
Frontend -> Frontend: 31. Local validation & generate proof
note right of Frontend: Action proof contains:\n- Action type\n- Timestamp\n- Action data\n- Client signature\n- Expected points
Frontend -> API Server: 32. POST /api/score/update {action_proof, timestamp}

# === PHASE 5: SECURITY VALIDATION ===
API Server -> Auth Service: 33. Validate JWT token
Auth Service -> API Server: 34. Token valid + user_id + permissions
API Server -> API Server: 35. Validate action proof
note right of API Server: Validation checks:\n- Timestamp freshness (<30s)\n- Action signature valid\n- Rate limiting\n- No duplicate actions\n- Score increment reasonable
API Server -> Database: 36. SELECT user permissions & current score
Database -> API Server: 37. Return user data {id, score, permissions}
API Server -> API Server: 38. Final security checks passed

# === PHASE 6: SCORE UPDATE ===
API Server -> Database: 39. BEGIN TRANSACTION
API Server -> Database: 40. UPDATE users SET score = score + ? WHERE id = ?
API Server -> Database: 41. INSERT INTO score_history (user_id, action, points, timestamp)
Database -> API Server: 42. Transaction successful
API Server -> Database: 43. COMMIT TRANSACTION
Database -> API Server: 44. Return new score value

# === PHASE 7: CACHE INVALIDATION & REFRESH ===
API Server -> Redis Cache: 45. DELETE "top_10_scores"
API Server -> Database: 46. SELECT TOP 10 * FROM users ORDER BY score DESC
Database -> API Server: 47. Return updated top 10 leaderboard
API Server -> Redis Cache: 48. SET "top_10_scores" with new data

# === PHASE 8: RESPONSE TO USER ===
API Server -> Frontend: 49. HTTP 200 {success: true, new_score, new_rank}
Frontend -> User: 50. Show success notification "Score updated!"

# === PHASE 9: LIVE BROADCAST ===
API Server -> WebSocket Server: 51. POST /broadcast/score-update
note right of API Server: Broadcast data:\n{type: "score_update",\ntop_10: [...],\nupdated_user: {id, username, score}}
WebSocket Server -> Frontend: 52. Emit "score_update" to original user
WebSocket Server -> Other Users: 53. Emit "score_update" to all connected users
Frontend -> User: 54. Update scoreboard with smooth animation
Other Users -> Other Users: 55. Update their scoreboards in real-time

# === ERROR HANDLING FLOWS ===
alt Invalid JWT Token
    Auth Service -> API Server: 401 Invalid token
    API Server -> Frontend: HTTP 401 Unauthorized
    Frontend -> User: Redirect to login page
end

alt Action Validation Fails
    API Server -> API Server: Validation failed
    API Server -> Frontend: HTTP 400 {error: "Invalid action proof"}
    Frontend -> User: Show error "Action could not be verified"
end

alt Rate Limit Exceeded
    API Server -> API Server: Rate limit check failed
    API Server -> Frontend: HTTP 429 Too Many Requests
    Frontend -> User: Show "Please wait 60s before next action"
end

alt Database Transaction Fails
    Database -> API Server: Transaction rollback
    API Server -> Frontend: HTTP 500 Internal Server Error
    Frontend -> User: Show "Something went wrong, try again"
end

alt WebSocket Connection Lost
    WebSocket Server -> Frontend: Disconnect event
    Frontend -> Frontend: Set status = "Disconnected"
    Frontend -> User: Show "🔴 Disconnected" + retry button
    Frontend -> WebSocket Server: Attempt reconnection
end

alt Concurrent Score Updates
    Database -> API Server: Optimistic locking conflict
    API Server -> API Server: Retry transaction with fresh data
    API Server -> Database: UPDATE with current score value
    Database -> API Server: Success on retry
end

# === ADDITIONAL SECURITY SCENARIOS ===
alt Malicious Action Proof
    API Server -> API Server: Invalid signature detected
    API Server -> Database: LOG security_incidents (user_id, action, timestamp)
    API Server -> Frontend: HTTP 403 Forbidden
    Frontend -> User: Account flagged for review
end

alt Replay Attack Detected
    API Server -> Database: CHECK action_history for duplicate
    Database -> API Server: Duplicate action found
    API Server -> Frontend: HTTP 409 Conflict "Action already processed"
    Frontend -> User: Show "This action was already completed"
end

alt Score Manipulation Attempt
    API Server -> API Server: Score increment too high for action
    API Server -> Database: LOG suspicious_activity
    API Server -> Frontend: HTTP 422 Unprocessable Entity
    Frontend -> User: Show "Invalid action data"
end