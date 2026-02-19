---
type: Feature
name: Refund Logic
title: Refund Logic
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As a** Donor,
**I want to** a refund if a request is cancelled.

## Description
Allow donors to reclaim funds if status becomes **Cancelled**.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── mutual_aid.rs
```

---

## Functional Requirements
- **Prerequisite**: Need to track donations (See **Issue #21/Events**).
- **Logic**: Push or Pull refund. **Pull is safer**.

---

## Suggested Implementation
```rust
// IN FUNCTION: claim_refund(env, request_id)

// 1. Load Request. Check status is 'Cancelled'.
// 2. Look up 'Donation(request_id, caller)' in storage.
// 3. If amount > 0, transfer amount back to caller.
// 4. Set Donation amount to 0.
```

---

## Acceptance Criteria
- [ ] Only works if **Cancelled**.
- [ ] Refund exact amount.

---

## Submission Guidelines
- **Branch**: `feat/refund-logic`
