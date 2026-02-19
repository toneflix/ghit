---
type: Feature
name: Reentrancy Guards
title: Reentrancy Guards
labels: @geevapp/app/wave2
assignees: 
---

# User Story

* As a Dev, I want to prevent reentrancy attacks during transfers.

---

# Description

* Implement a lock pattern for functions that send tokens to prevent reentrancy attacks.

---

# Files to Create / Edit

* contracts/geev-core/src/
  - utils.rs

---

# Functional Requirements

* **Lock**  
  - Set a temporary flag before execution

* **Unlock**  
  - Remove flag after execution

---

# Suggested Implementation

* **Function:** `with_reentrancy_guard(env, lambda)`  

  1. Check if `'Lock'` key exists in Temporary Storage. If so, `panic!`  
  2. Set `'Lock'` key to `true`  
  3. Execute the lambda function (the main logic)  
  4. Remove `'Lock'` key

---

# Acceptance Criteria

* [ ] Applied to `distribute_prize` and `withdraw_aid`

---

# Submission Guidelines

* **Branch:** `security/reentrancy`
