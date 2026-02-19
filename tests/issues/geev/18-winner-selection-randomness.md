---
type: Feature
name: Winner Selection (Randomness)
title: Winner Selection (Randomness)
labels: @geevapp/app/wave2
assignees: 
---

# User Story

As a Creator, I want to pick a winner randomly when the time is up.

---

# Description

This implements winner selection logic for a giveaway.

The function:

- Can only be executed after `end_time`
- Uses pseudo-randomness (ledger-based) for MVP
- Selects a valid participant index
- Updates giveaway state to `Claimable`

⚠️ For MVP, randomness is derived from `env.prng()`.

---

# Files to Create / Edit

```
contracts/geev-core/src/
└── giveaway.rs
```

---

# Functional Requirements

- Timing  
  - Can only execute after `end_time`

- Status Validation  
  - Giveaway must be `Active`

- Randomness  
  - Generate `r` where:
    ```
    0 <= r < participant_count
    ```

- Mapping  
  - Map index `r` to a user address  
  - Requires `ParticipantIndex(giveaway_id, index)` storage structure (see Issue #12)

- State Update  
  - Set `winner`
  - Change status to `Claimable`
  - Persist updated struct

---

# Suggested Implementation

## In Function: `pick_winner(env, giveaway_id)`

1. Load Giveaway struct  
   - If missing → panic  
   - Ensure status is `Active`

2. Check timing:
   ```
   if env.ledger().timestamp() <= giveaway.end_time {
       panic("Giveaway Still Active");
   }
   ```

3. Generate pseudo-random seed:
   ```
   let random_seed = env.prng().gen::<u64>();
   ```

4. Calculate winner index:
   ```
   winner_index = random_seed % participant_count
   ```

5. Retrieve winner address from:
   ```
   ParticipantIndex(giveaway_id, winner_index)
   ```

6. Update Giveaway struct:
   - `winner = selected_address`
   - `status = Claimable`

7. Save updated Giveaway struct to storage

---

# Acceptance Criteria

- [ ] Fails if giveaway is still active  
- [ ] Selects a valid participant  
- [ ] Updates status to `Claimable`  

---

# Submission Guidelines

- **Branch:** `feat/winner-selection`
