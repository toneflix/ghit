---
type: Feature
name: Implement Pause/Unpause
title: Implement Pause/Unpause
labels: @geevapp/app/wave2
assignees: 
---

# User Story

* As an Admin, I want to pause the contract to stop attacks.

---

# Description

* A global switch that prevents public actions when activated, effectively stopping any unwanted or malicious activity.

* ⚠️ This function must be **strictly guarded** and callable only by the stored Admin address.

---

# Files to Create / Edit

* contracts/geev-core/src/
  - lib.rs

---

# Functional Requirements

* **Storage**  
  - `is_paused` (bool)

* **Modifier / Check**  
  - Check `is_paused` at the start of every public function  
  - Panic with error `"ContractPaused"` if true

* **Admin Function**: `set_paused(env, val)`  
  - Require Admin authentication  
  - Set `Paused` key to `val`

---

# Suggested Implementation

* **Function:** `set_paused(env, val)`  
  - Authenticate Admin  
  - Write `val` to `Paused` key in storage

* **Helper / Modifier:** `check_paused(env)`  
  - Read `Paused` key from storage  
  - If `true`, `panic!("ContractPaused")`

---

# Acceptance Criteria

* [ ] Public users cannot create or enter when paused  
* [ ] Admin can still perform actions

---

# Submission Guidelines

* **Branch:** `feat/pause-logic`
