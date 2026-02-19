---
type: Feature
name: Profile Registry (User Metadata)
title: Profile Registry (User Metadata)
labels: @geevapp/app/wave2
assignees: 
---

## User Story

As a User, I want to link my wallet to a username so people recognize me.

## Description

Maps Address → ProfileData.

## Files to Create / Edit

```
contracts/geev-core/src/
└── profile.rs
```

## Functional Requirements

- One username per address  
- Store username and IPFS avatar hash  
- Optional reverse lookup for uniqueness  

## Suggested Implementation

IN FUNCTION: set_profile(env, user, username, avatar_hash)

1. Verify user auth  
2. Create Profile struct  
3. Save under key Profile(user_address)  
4. (Optional) Maintain Username(string) → Address mapping  

## Acceptance Criteria

- [ ] User can update profile  
- [ ] Metadata retrievable  

## Submission Guidelines

Branch: feat/profile-registry  