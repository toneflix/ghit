---
type: Feature
name: Access Control Modifiers
title: Access Control Modifiers
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As a** Dev,
**I want to** a reusable way to check Admin permissions.

## Description
A helper function for admin checks.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── access.rs
```

---

## Functional Requirements
- **Helper**: `fn check_admin(env)`.

---

## Suggested Implementation
```rust
// IN FUNCTION: check_admin(env)

// 1. Load Admin key from Instance Storage.
// 2. Call 'admin.require_auth()'.
// 3. If Key missing or Auth fails, return explicit error.
```

---

## Acceptance Criteria
- [ ] Used in all admin functions.

---

## Submission Guidelines
- **Branch**: `refactor/access-control`
