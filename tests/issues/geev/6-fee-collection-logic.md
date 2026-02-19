---
type: Feature
name: Fee Collection Logic
title: Fee Collection Logic
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As the** Platform,
**I want to** collect 1% of giveaways as revenue.

## Description
Calculate and deduct a fee from the pot.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── giveaway.rs
```

---

## Functional Requirements
- **Math**: `fee = amount * 1%`.
- **Accounting**: `net_prize = amount - fee`.

---

## Suggested Implementation
```rust
// IN FUNCTION: distribute_prize

// 1. Load 'fee_bps' from storage.
// 2. Calculate 'fee_amount'.
// 3. Transfer 'net_prize' to Winner.
// 4. Add 'fee_amount' to a 'CollectedFees' storage counter (do not transfer yet).
```

---

## Acceptance Criteria
- [ ] Winner gets Total - Fee.
- [ ] Fee counter increases.

---

## Submission Guidelines
- **Branch**: `feat/fees`
