---
type: Feature
name: Create Giveaway Logic (Escrow)
title: Create Giveaway Logic (Escrow)
labels: @geevapp/app/wave2
assignees: 
---

# User Story

As a Creator, I want to create a giveaway and lock my tokens immediately so that participants know the prize is guaranteed.

---

# Description

This is the core logic responsible for spawning a new giveaway.

The contract must:

- Escrow tokens immediately
- Store giveaway data on-chain
- Emit an event for indexing

⚠️ Token transfer must happen **before** the giveaway record is finalized.

---

# Files to Create / Edit

```
contracts/geev-core/src/
└── giveaway.rs
```

---

# Functional Requirements

- Auth  
  - Require creator signature using `require_auth()`

- Transfer  
  - Move tokens from `creator` to `current_contract_address`

- Storage  
  - Generate a new Giveaway ID  
  - Create a `Giveaway` struct  
  - Save to persistent storage  

- Event  
  - Emit `GiveawayCreated` event for the NestJS indexer  

---

# Suggested Implementation

## In Function: `create_giveaway(env, creator, token, amount, end_time)`

1. Call `creator.require_auth()` to verify signature

2. Initialize the Token Client using the provided `token` address

3. Execute:
   ```
   token_client.transfer(
       from: creator,
       to: contract,
       amount
   )
   ```

4. Generate a new Giveaway ID  
   - Increment a counter stored in contract storage

5. Create a `Giveaway` struct with:
   - `status = Active`
   - `creator`
   - `token`
   - `amount`
   - `end_time`

6. Save struct to Persistent Storage under key:
   ```
   Giveaway(id)
   ```

7. Emit event:
   ```
   GiveawayCreated(id, creator, amount, token)
   ```

---

# Acceptance Criteria

- [ ] Funds are deducted from Creator  
- [ ] Contract balance increases  
- [ ] Giveaway struct is retrievable by ID  

---

# Submission Guidelines

- **Branch:** `feat/create-giveaway`
