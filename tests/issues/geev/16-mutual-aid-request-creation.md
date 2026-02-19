---
type: Feature
name: Mutual Aid Request Creation
title: Mutual Aid Request Creation
labels: @geevapp/app/wave2
assignees: 
---

# User Story

As a User, I want to post a help request with a funding goal.

---

# Description

This implements the logic for creating a **Help Request** (Mutual Aid entry).

Unlike giveaways:

- ❌ No funds are locked upfront  
- ✅ A funding bucket is opened  
- ✅ Contributors can fund toward a goal  

The request tracks progress until the funding goal is reached.

---

# Files to Create / Edit

```
contracts/geev-core/src/
└── mutual_aid.rs
```

---

# Functional Requirements

- Struct Definition  

  Create `HelpRequest` struct containing:

  - `recipient`
  - `goal`
  - `raised_amount`
  - `token`
  - `ipfs_hash`
  - `status`

- Validation  

  - Ensure `goal > 0`

- Initialization  

  - `raised_amount` must start at `0`
  - `status` must be `Active`

- Storage  

  - Generate a unique Request ID  
  - Save struct to persistent storage  

- Event  

  - Emit `RequestCreated`

---

# Suggested Implementation

## In Function: `create_request(env, recipient, token, goal, metadata_hash)`

1. Call:
   ```
   recipient.require_auth()
   ```

2. Validate goal:
   ```
   if goal <= 0 {
       panic("Invalid Goal");
   }
   ```

3. Generate new Request ID  
   - Increment stored counter  

4. Create `HelpRequest` struct:
   - `recipient`
   - `token`
   - `goal`
   - `raised_amount = 0`
   - `ipfs_hash = metadata_hash`
   - `status = Active`

5. Save struct to Persistent Storage under:
   ```
   HelpRequest(id)
   ```

6. Emit event:
   ```
   RequestCreated(id, recipient, goal, token)
   ```

---

# Acceptance Criteria

- [ ] Request saved to storage  
- [ ] Raised amount starts at `0`  

---

# Submission Guidelines

- **Branch:** `feat/create-aid`
