# ADR-005: Cryptographic Action Proofs for Security

## Status
Accepted

## Date
2025-07-17

## Context
The live scoreboard system must prevent malicious users from manipulating scores without authorization. Traditional server-side validation alone is insufficient for a system where actions are performed client-side and then reported to the server.

## Decision
We have decided to implement cryptographic action proofs that clients must generate and submit with score update requests to prove the authenticity of their actions.

## Rationale
1. **Tamper Prevention**: Cryptographic signatures prevent manipulation of action data
2. **Replay Attack Prevention**: Timestamps and nonces prevent reuse of valid proofs
3. **Client-Side Validation**: Proves action was performed legitimately on client
4. **Non-Repudiation**: Provides audit trail of user actions
5. **Scalable Security**: Reduces server-side validation complexity
6. **Flexible Action Types**: Can handle various game/action types with same framework

## Consequences

### Positive
- Strong protection against score manipulation
- Prevents replay attacks and duplicate submissions
- Provides comprehensive audit trail
- Scales well with user base growth
- Flexible framework for different action types
- Enables offline action validation

### Negative
- Increased client-side complexity
- Requires secure key management
- Additional computation overhead
- More complex debugging and testing
- Potential for client-side key compromise
- Clock synchronization requirements

## Technical Implementation

### Action Proof Structure
```json
{
  "action_proof": {
    "action_type": "puzzle_complete",
    "timestamp": "2025-07-17T10:30:00Z",
    "action_data": {
      "puzzle_id": "abc123",
      "completion_time": 45.2,
      "moves_count": 127
    },
    "client_signature": "SHA256_HMAC_signature",
    "expected_points": 100,
    "nonce": "random_unique_string"
  }
}
```

### Signature Generation
```javascript
// Client-side proof generation
const actionData = {
  action_type: "puzzle_complete",
  timestamp: new Date().toISOString(),
  action_data: puzzleResult,
  expected_points: calculatePoints(puzzleResult),
  nonce: generateRandomNonce()
};

const signature = crypto
  .createHmac('sha256', clientSecret)
  .update(JSON.stringify(actionData))
  .digest('hex');

actionData.client_signature = signature;
```

### Server-side Validation Process
1. **Timestamp Validation**: Ensure action is recent (< 30 seconds)
2. **Signature Verification**: Validate HMAC signature with user's secret
3. **Nonce Checking**: Verify nonce hasn't been used before
4. **Action Validation**: Confirm action data is reasonable and consistent
5. **Rate Limiting**: Prevent rapid-fire submissions
6. **Score Calculation**: Verify expected points match action type

## Security Measures

### Key Management
- Unique client secrets per user session
- Secure key distribution during authentication
- Regular key rotation for long-lived sessions
- Secure storage of keys in client applications

### Validation Checks
```python
def validate_action_proof(proof, user_secret):
    # Timestamp freshness check
    if not is_timestamp_fresh(proof.timestamp, max_age=30):
        raise InvalidActionError("Timestamp too old")
    
    # Signature verification
    expected_signature = generate_hmac(proof, user_secret)
    if not secure_compare(proof.signature, expected_signature):
        raise InvalidActionError("Invalid signature")
    
    # Nonce uniqueness check
    if is_nonce_used(proof.nonce, proof.user_id):
        raise InvalidActionError("Nonce already used")
    
    # Action-specific validation
    validate_action_data(proof.action_type, proof.action_data)
    
    return True
```

### Additional Security Layers
- Rate limiting per user (max 10 actions per minute)
- Score reasonableness checks (max points per action type)
- Pattern analysis for detecting bot behavior
- IP-based anomaly detection
- Device fingerprinting for additional validation

## Monitoring and Detection
- Track signature validation failure rates
- Monitor for unusual action patterns
- Alert on rapid score increases
- Log all security incidents for analysis
- Real-time fraud detection algorithms

## Alternatives Considered
1. **Server-side Only Validation**: Insufficient for preventing client manipulation
2. **Blockchain-based Proofs**: Too complex and resource-intensive
3. **Third-party Anti-cheat Services**: External dependency and cost
4. **Challenge-Response Systems**: More complex user experience
5. **Trusted Execution Environments**: Limited browser support

## Performance Considerations
- Efficient HMAC computation on client and server
- Batch validation for multiple actions
- Asynchronous signature verification
- Caching of validation results
- Optimized nonce storage and lookup

## Implementation Timeline
1. **Phase 1**: Basic proof generation and validation
2. **Phase 2**: Advanced fraud detection and monitoring
3. **Phase 3**: Machine learning-based anomaly detection
4. **Phase 4**: Advanced key management and rotation

## Testing Strategy
- Unit tests for signature generation and validation
- Integration tests for full proof workflow
- Security testing with attempted manipulations
- Performance testing under load
- Penetration testing for vulnerabilities
