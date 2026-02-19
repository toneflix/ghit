---
type: Feature
name: Milestone Withdrawal
title: Milestone Withdrawal
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As a** Recipient,
**I want to** withdraw part of my aid funds early.

## Description
Allow withdrawing `current_raised` without closing the request.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── mutual_aid.rs
```

---

## Functional Requirements
- **Track**: `amount_withdrawn` in struct.
- **Limit**: `available = raised - withdrawn`.

---

## Suggested Implementation
```rust
// IN FUNCTION: withdraw_aid(env, request_id, amount)

// 1. Recipient auth.
// 2. Load Request.
// 3. Ensure 'amount <= (raised - withdrawn)'.
// 4. Transfer 'amount' to recipient.
// 5. Update 'withdrawn' in struct.
// 6. Save struct.
```

---

## Acceptance Criteria
- [ ] Cannot withdraw more than raised.
- [ ] State persists correctly.

---

## Submission Guidelines
- **Branch**: `feat/milestone-withdraw`
