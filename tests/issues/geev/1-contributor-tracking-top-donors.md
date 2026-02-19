---
type: Feature
name: Contributor Tracking (Top Donors)
title: Contributor Tracking (Top Donors)
labels: @geevapp/app/wave2
assignees: 
---

# User Story
**As a** User,
**I want to** see who the top contributors are for a help request so that I can recognize their generosity.

## Description
We need a way to track how much each user has donated to a specific request. Since on-chain storage is expensive, we will store a limited list or rely on **Events** for the frontend to index.

---

## Files to Create/Edit
```
contracts/geev-core/src/
└── mutual_aid.rs
```

---

## Functional Requirements
- **Event Emission**: The most gas-efficient way is to emit a `DonationReceived` event with `{ donor, amount, request_id }`.
- **On-Chain Check (Optional)**: If we need on-chain rewards, we might store a `Map<Donor, Amount>` but only for the top 10 to save gas. **Decision**: Use Events for full history, Map for active permissions.

---

## Suggested Implementation
```rust
// IN FUNCTION: donate(env, request_id, amount)

// 1. After the successful token transfer...
// 2. Construct a distinct Event topic referencing "donation".
// 3. Publish the event containing:
//    - The donor's address.
//    - The Request ID they donated to.
//    - The Amount given.
// 4. (Optional) If keeping on-chain stats:
//    - Retrieve the current 'total_donated' for this user from Temporary Storage.
//    - Increment and save it back.
```

---

## Acceptance Criteria
- [ ] Every donation triggers an event.
- [ ] Indexer (NestJS) can reconstruct the leaderboard from these events.

---

## Submission Guidelines
- **Branch**: `feat/contributor-tracking`
