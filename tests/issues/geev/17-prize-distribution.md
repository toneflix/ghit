---
type: Feature
name: Prize Distribution
title: Prize Distribution
labels: @geevapp/app/wave2
assignees: 
---

# User Story

As a Winner, I want the contract to send me the prize money.

---

# Description

This implements the prize distribution logic.

The function:

- Transfers escrowed tokens from the contract to the winner  
- Finalizes the giveaway lifecycle  
- Emits an event for indexing  

---

# Files to Create / Edit

```
contracts/geev-core/src/
└── giveaway.rs
```

---

# Functional Requirements

- Status Check  
  - Giveaway status must be `Claimable`

- Transfer  
  - Send `amount` from contract to `winner`

- Close  
  - Update status to `Completed`

- Event  
  - Emit `PrizeClaimed`

---

# Suggested Implementation

## In Function: `distribute_prize(env, giveaway_id)`

1. Load the `Giveaway` struct  
   - If missing → panic  

2. Ensure status is:
   ```
   Claimable
   ```
   - Otherwise → panic  

3. Identify from struct:
   - `winner`
   - `token`
   - `amount`

4. Initialize Token Client using `token`

5. Execute transfer:
   ```
   token_client.transfer(
       from: contract,
       to: winner,
       amount
   )
   ```

6. Update Giveaway struct:
   ```
   status = Completed
   ```

7. Save updated struct back to storage

8. Emit event:
   ```
   PrizeClaimed(giveaway_id, winner, amount)
   ```

---

# Acceptance Criteria

- [ ] Winner receives tokens  
- [ ] Contract balance decreases  
- [ ] Giveaway marked `Completed`  

---

# Submission Guidelines

- **Branch:** `feat/prize-distro`
