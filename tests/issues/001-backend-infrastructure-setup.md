---
type: Feature
name: Backend Infrastructure Setup
title: Initialize API with Next.js API routes, food and database configuration
labels: 'backend, infrastructure, setup'
assignees: ''
---

## Summary

Set up the backend infrastructure including Next.js API routes, Prisma ORM database connection, and environment configuration for the Geev API.

---

## Context

The application needs a backend API to handle data persistence, authentication, and business logic beyond client-side operations.

---

## Goal

Complete backend infrastructure ready to support API endpoints and database operations.

---

## Scope

**In Scope:**

- Next.js API routes setup
- Database selection and configuration
- Environment variables for backend
- Database connection utilities
- Error handling middleware
- API response utilities

**Out of Scope:**

- Specific API endpoints (covered in other issues)
- Authentication implementation
- Database migrations

---

## Tasks

- [ ] Install Prisma ORM (`prisma` and `@prisma/client`)
- [ ] Initialize Prisma with PostgreSQL provider
- [ ] Setup environment variables for database (DATABASE_URL)
- [ ] Create Prisma client singleton utility
- [ ] Create API route structure in `app/api/`
- [ ] Create error handling middleware
- [ ] Create API response utilities (success, error)
- [ ] Setup CORS configuration
- [ ] Add request logging
- [ ] Test database connection
- [ ] Document API structure

---

## Acceptance Criteria

- [ ] Prisma initialized and client generated
- [ ] Database connects successfully via Prisma
- [ ] API routes can be created in `app/api/`
- [ ] Error handling catches and formats errors
- [ ] Environment variables properly configured
- [ ] Prisma client properly configured with singleton pattern
- [ ] API utilities available for all endpoints

---

## Technical Notes

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Test connection
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Prisma connected to database');
    return true;
  } catch (error) {
    console.error('Prisma connection failed:', error);
    return false;
  }
}
```

```typescript
// lib/api-response.ts
export function apiSuccess<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function apiError(message: string, status = 500) {
  return Response.json({ success: false, error: message }, { status });
}
```

---

## Difficulty

🟡 Intermediate
