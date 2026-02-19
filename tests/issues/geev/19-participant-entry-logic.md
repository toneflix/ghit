---
type: Feature
name: Participant Entry Logic
title: Participant Entry Logic
labels: @geevapp/app/wave2
assignees: 
---

# User Story

As a User, I want to enter a specific giveaway so that I have a chance to win.

---

# Description

This implements the logic for a user to register for a giveaway.

The contract must enforce:

- Time restrictions  
- Duplicate entry prevention  
- Proper participant tracking  

---

# Files to Create / Edit

```
contracts/geev-core/src/
└── giveaway.rs
```

---

# Functional Requirements

- Auth  
  - Require user signature using `require_auth()`

- Time Check  
  - Ensure `current_time < giveaway.end_time`

- Duplication Check  
  - Ensure the user has not already entered this specific giveaway ID

- Storage  
  - Record participant entry  
  - Increment `participant_count`

---

# Suggested Implementation

## In Function: `enter_giveaway(env, user, giveaway_id)`

1. Call `user.require_auth()` to verify signature

2. Load the `Giveaway` struct  
   - If missing → panic

3. Check time:
   ```
   if env.ledger().timestamp() > giveaway.end_time {
       panic("Giveaway Ended");
   }
   ```

4. Construct participant storage key:
   ```
   Participant(giveaway_id, user)
   ```

5. Check if key already exists  
   - If yes → panic ("Double Entry")

6. Save participant key with value:
   ```
   true
   ```

7. Increment:
   ```
   giveaway.participant_count += 1
   ```

8. Save updated Giveaway struct back to storage

---

# Acceptance Criteria

- [ ] Rejects entries after end time  
- [ ] Rejects duplicate entries  
- [ ] Increments participant count correctly  

---

# Submission Guidelines

- **Branch:** `feat/enter-giveaway`
