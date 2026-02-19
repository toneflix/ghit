---
type: Feature
name: Admin Fee Withdrawal
title: Admin Fee Withdrawal
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As an** Admin,
**I want to** withdraw collected fees to the treasury.

## Description
Pull fees from the contract.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── admin.rs
```

---

## Functional Requirements
- **Input**: Token address.
- **Action**: Transfer `CollectedFees` of that token to Admin.

---

## Suggested Implementation
```rust
// IN FUNCTION: withdraw_fees(env, token)

// 1. Admin auth.
// 2. Read 'CollectedFees(token)' amount.
// 3. Transfer that amount to Admin.
// 4. Set 'CollectedFees(token)' to 0.
```

---

## Acceptance Criteria
- [ ] Resets fee counter.
- [ ] Treasury receives funds.

---

## Submission Guidelines
- **Branch**: `feat/withdraw-fees`
