---
type: Task
name: Database Schema & Models
title: Define database schema and create Prisma models for all entities
labels: 'backend, database, schema'
assignees: ''
---

## Summary

Design and implement the complete database schema using Prisma ORM with models for users, posts, entries, interactions, and badges.

---

## Context

A well-designed database schema using Prisma ORM is critical for data integrity, type safety, query performance, and future scalability.

**Dependencies:** Requires Backend Issue 001 (Infrastructure Setup).

---

## Goal

Complete database schema with all tables, relationships, and indexes.

---

## Scope

**In Scope:**

- Users table
- Posts table (giveaways/requests)
- Entries table
- Comments/replies table
- Likes/burns table
- Badges table
- User stats table
- Transactions table (for future wallet)

**Out of Scope:**

- Data seeding (separate issue)
- Complex stored procedures
- Advanced indexing optimization

---

## Tasks

- [ ] Install Prisma and initialize Prisma client
- [ ] Create Prisma schema file (schema.prisma)
- [ ] Define User model
- [ ] Define Post model
- [ ] Define Entry model
- [ ] Define Comment model
- [ ] Define Interaction model
- [ ] Define Badge model
- [ ] Define UserBadge junction model
- [ ] Define Transaction model
- [ ] Add indexes and constraints
- [ ] Generate Prisma client
- [ ] Create and run initial migration
- [ ] Document schema design

---

## Acceptance Criteria

- [ ] Prisma schema file created with all models
- [ ] Prisma client generated successfully
- [ ] Relations properly configured between models
- [ ] Indexes on commonly queried fields
- [ ] Timestamps (createdAt, updatedAt) on all models
- [ ] Schema provides full type safety with TypeScript
- [ ] Migration created and applied successfully
- [ ] Migration can be rolled back using Prisma migrate

---

## Technical Notes

**Prisma Schema Structure:**

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  walletAddress String         @unique @map("wallet_address") @db.VarChar(56)
  name          String         @db.VarChar(255)
  bio           String?
  avatarUrl     String?        @map("avatar_url")
  xp            Int            @default(0)
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")

  posts         Post[]         @relation("PostCreator")
  entries       Entry[]
  comments      Comment[]
  interactions  Interaction[]
  badges        UserBadge[]

  @@map("users")
}

enum PostType {
  giveaway
  request
}

enum PostStatus {
  open
  closed
  completed
}

enum SelectionMethod {
  random
  manual
}

model Post {
  id              String          @id @default(uuid())
  creatorId       String          @map("creator_id")
  type            PostType
  title           String          @db.VarChar(200)
  description     String
  category        String          @db.VarChar(50)
  status          PostStatus      @default(open)
  selectionMethod SelectionMethod @default(random) @map("selection_method")
  winnerCount     Int             @default(1) @map("winner_count")
  media           Json?
  endsAt          DateTime        @map("ends_at")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  creator         User            @relation("PostCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  entries         Entry[]
  interactions    Interaction[]

  @@index([creatorId])
  @@index([status])
  @@index([category])
  @@index([createdAt(sort: Desc)])
  @@map("posts")
}

model Entry {
  id        String    @id @default(uuid())
  postId    String    @map("post_id")
  userId    String    @map("user_id")
  content   String
  proofUrl  String?   @map("proof_url")
  isWinner  Boolean   @default(false) @map("is_winner")
  createdAt DateTime  @default(now()) @map("created_at")

  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  comments  Comment[]

  @@unique([postId, userId])
  @@index([postId])
  @@index([userId])
  @@map("entries")
}

model Comment {
  id        String    @id @default(uuid())
  entryId   String    @map("entry_id")
  userId    String    @map("user_id")
  content   String
  parentId  String?   @map("parent_id")
  createdAt DateTime  @default(now()) @map("created_at")

  entry     Entry     @relation(fields: [entryId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies   Comment[] @relation("CommentReplies")

  @@map("comments")
}

enum InteractionType {
  like
  burn
}

model Interaction {
  id        String          @id @default(uuid())
  userId    String          @map("user_id")
  postId    String          @map("post_id")
  type      InteractionType
  createdAt DateTime        @default(now()) @map("created_at")

  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  post      Post            @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId, type])
  @@index([postId])
  @@map("interactions")
}

model Badge {
  id          String      @id @db.VarChar(50)
  name        String      @db.VarChar(100)
  description String?
  tier        String      @db.VarChar(20)
  iconUrl     String?     @map("icon_url")
  criteria    Json?

  users       UserBadge[]

  @@map("badges")
}

model UserBadge {
  userId    String   @map("user_id")
  badgeId   String   @map("badge_id")
  awardedAt DateTime @default(now()) @map("awarded_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge     Badge    @relation(fields: [badgeId], references: [id])

  @@id([userId, badgeId])
  @@map("user_badges")
}
```

---

## Difficulty

🟠 Advanced
