---
type: Feature
name: Donation Logic (Mutual Aid)
title: Donation Logic (Mutual Aid)
labels: @geevapp/app/wave2
assignees: 
---

# User Story

As a Donor, I want to contribute tokens to a specific help request.

---

# Description

This implements the donation logic for a Help Request.

The function:

- Transfers tokens from the Donor to the Contract  
- Updates the funding progress  
- Marks the request as fully funded if the goal is reached  

---

# Files to Create / Edit

```
contracts/geev-core/src/
└── mutual_aid.rs
```

---

# Functional Requirements

- Auth  
  - Require donor signature using `require_auth()`

- Transfer  
  - Move tokens from `donor` to `contract`

- State Update  
  - Increment `raised_amount`

- Completion Check  
  - If `raised_amount >= goal`  
    - Set status to `FullyFunded`

- Event  
  - Emit `DonationReceived`

---

# Suggested Implementation

## In Function: `donate(env, donor, request_id, amount)`

1. Call:
   ```
   donor.require_auth()
   ```

2. Load `HelpRequest` struct  
   - If missing → panic  

3. Initialize Token Client using the request's `token`

4. Execute transfer:
   ```
   token_client.transfer(
       from: donor,
       to: contract,
       amount
   )
   ```

5. Calculate:
   ```
   new_raised = current_raised + amount
   ```

6. Update struct:
   - `raised_amount = new_raised`

7. If:
   ```
   new_raised >= goal
   ```
   - Set:
     ```
     status = FullyFunded
     ```

8. Save updated struct back to storage

9. Emit event:
   ```
   DonationReceived(request_id, donor, amount)
   ```

---

# Acceptance Criteria

- [ ] Contract receives funds  
- [ ] Request state updates correctly  

---

# Submission Guidelines

- **Branch:** `feat/donation-logic`
