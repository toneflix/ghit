---
type: Feature
name: Support Native XLM
title: Support Native XLM
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As a** User,
**I want to** use native XLM, not just wrapped tokens.

## Description
Ensure the contract handles the Native Token Address correctly.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── lib.rs
```

---

## Functional Requirements
- **Integration**: Use Soroban's native token client.

---

## Suggested Implementation
```rust
// 1. In 'create_giveaway', ensure the 'token' argument can accept the Native Token Contract Address.
// 2. No specific code logic change, but crucial integration test required to verify 'Client::new' works with the native address.
```

---

## Acceptance Criteria
- [ ] Tested with Native XLM address.

---

## Submission Guidelines
- **Branch**: `chore/native-support`
