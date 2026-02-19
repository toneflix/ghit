---
type: Feature
name: Initialize Giveaway Contract and Factory
title: Initialize Giveaway Contract and Factory
labels: @geevapp/app/wave2
assignees: 
---

# User Story

As a System Admin, I want to initialize the main contract with a governance address and fee settings so that the system has a secure owner from day one.

---

# Description

This is the **constructor / initialization logic** of the contract.

It sets up the singleton state for the contract by:

- Defining who the **Admin** is
- Setting the default **protocol fee**

This ensures the contract cannot be taken over after deployment.

---

# Files to Create / Edit

```
contracts/geev-core/src/
├── lib.rs          # Main entry point
└── storage.rs      # Storage keys definition
```

---

# Functional Requirements

- Check State  
  - Ensure the contract has **not already been initialized**
  - Prevent contract takeover

- Store Admin  
  - Save the `admin` address to **Instance Storage**

- Store Fees  
  - Save `fee_basis_points` (e.g., `100 = 1%`) to **Instance Storage**

---

# Suggested Implementation

## In Function: `init(env, admin, fee_bps)`

1. Check if the `Admin` key already exists in Instance Storage  
   - If yes → panic with `"Already Initialized"`

2. Write the `admin` address to the `Admin` storage key

3. Write the `fee_bps` (`u32`) to the `Fee` storage key

4. (Optional) Emit event:
   - `ContractInitialized`

---

# Acceptance Criteria

- [ ] Calling `init` twice fails  
- [ ] Admin address is correctly saved  
- [ ] Fees are correctly saved  

---

# Submission Guidelines

- **Branch:** `feat/contract-init`
