---
type: Feature
name: Token Whitelist Logic
title: Token Whitelist Logic
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As an** Admin,
**I want to** only allow specific tokens (USDC, XLM) to prevent spam.

## Description
A list of allowed token addresses.

---

## Files to Create/Edit
```
contracts/geev-core/src/
├── storage.rs
└── admin.rs
```

---

## Functional Requirements
- **Storage**: `Map<TokenAddress, bool>`.
- **Check**: Verify token is allowed during creation.

---

## Suggested Implementation
```rust
// IN FUNCTION: create_giveaway

// 1. Check storage for 'AllowedToken(token_address)'.
// 2. If false/missing, panic "TokenNotSupported".

// IN FUNCTION: add_token(env, token)
// 1. Admin auth.
// 2. Set 'AllowedToken(token)' to true.
```

---

## Acceptance Criteria
- [ ] Blocks unknown tokens.

---

## Submission Guidelines
- **Branch**: `feat/token-whitelist`
