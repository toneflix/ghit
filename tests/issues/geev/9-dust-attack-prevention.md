---
type: Feature
name: Dust Attack Prevention
title: Dust Attack Prevention
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As a** Maintainer,
**I want to** block tiny giveaways that spam the system.

## Description
Enforce minimum amounts.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── giveaway.rs
```

---

## Functional Requirements
- **Config**: `MIN_AMOUNT = 5 XLM`.
- **Check**: Reject creation if `amount < MIN_AMOUNT`.

---

## Suggested Implementation
```rust
// IN FUNCTION: create_giveaway

// 1. Define constant MIN_LIMIT.
// 2. If 'amount < MIN_LIMIT', panic with "AmountTooLow".
```

---

## Acceptance Criteria
- [ ] Creation fails for small amounts.

---

## Submission Guidelines
- **Branch**: `feat/dust-prevention`
