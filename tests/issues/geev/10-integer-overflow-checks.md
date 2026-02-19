---
type: Feature
name: Integer Overflow Checks
title: Integer Overflow Checks
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As a** User,
**I want to** ensure math errors don't lose my money.

## Description
Use explicitly checked arithmetic.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── mutual_aid.rs
```

---

## Functional Requirements
- **Math**: Replace `+` with `checked_add`.
- **Math**: Replace `-` with `checked_sub`.

---

## Suggested Implementation
```rust
// THROUGHOUT CODE:

// 1. Identify all math operations on i128.
// 2. Replace 'a + b' with 'a.checked_add(b).unwrap_or_else(|| panic!(...))'.
// 3. Define specific error codes for Overflow.
```

---

## Acceptance Criteria
- [ ] No raw operators on token amounts.

---

## Submission Guidelines
- **Branch**: `security/safe-math`
