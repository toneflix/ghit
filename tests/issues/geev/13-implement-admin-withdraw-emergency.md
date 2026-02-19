---
type: Feature
name: Implement Admin Withdraw (Emergency)
title: Implement Admin Withdraw (Emergency)
labels: @geevapp/app/wave2
assignees: 
---

# User Story

As an Admin, I want to withdraw funds in an emergency (e.g., bug found) to rescue user assets.

---

# Description

This is an emergency “god mode” function that allows the Admin to drain funds from the contract if a critical issue is discovered.

⚠️ This function must be **strictly guarded** and callable only by the stored Admin address.

It enables rescuing user funds in case of:

- Critical contract bugs  
- Exploits  
- Migration requirements  

---

# Files to Create / Edit

```
contracts/geev-core/src/
└── admin.rs
```

---

# Functional Requirements

- Auth  
  - Retrieve Admin address from storage  
  - Require `admin.require_auth()`  

- Transfer Logic  
  - Allow transfer of any `amount`  
  - For any `token`  
  - From `contract` → specified safe address (`to`)  

- Event  
  - Emit `EmergencyWithdraw`  

---

# Suggested Implementation

IN FUNCTION: `admin_withdraw(env, token, amount, to)`

1. Load Admin address from storage  

2. Require Admin authentication  
   - Ensure caller matches stored Admin  
   - Call `admin.require_auth()`  

3. Initialize Token Client using provided `token` address  

4. Execute transfer:  
   - From: contract address  
   - To: `to`  
   - Amount: `amount`  

5. Emit event:  
   - `EmergencyWithdraw(token, amount, to)`  

---

# Acceptance Criteria

- [ ] Fails when called by non-admin  
- [ ] Successfully transfers funds when called by Admin  

---

# Submission Guidelines

- **Branch:** `feat/admin-withdraw`
