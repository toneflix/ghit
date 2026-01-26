---
type: Feature
name: Authentication API
title: Create authentication endpoints for wallet-based login
labels: 'backend, api, auth'
assignees: ''
---

## Summary

Implement authentication API endpoints for wallet-based login, session management, and user registration.

---

## Context

Users need to authenticate using their Stellar wallet addresses to access protected features.

**Dependencies:** Requires Backend Issue 001 (Infrastructure) and 002 (Database Schema).

---

## Goal

Complete authentication system with secure session management.

---

## Scope

**In Scope:**

- POST /api/auth/login - Wallet authentication
- POST /api/auth/register - Create new user
- POST /api/auth/logout - End session
- GET /api/auth/session - Get current session
- Session management with JWT or cookies
- Middleware for protected routes

**Out of Scope:**

- OAuth providers
- Email/password authentication
- Two-factor authentication

---

## Tasks

- [ ] Install authentication library (e.g., `jose` for JWT)
- [ ] Create POST /api/auth/login endpoint
- [ ] Create POST /api/auth/register endpoint
- [ ] Create POST /api/auth/logout endpoint
- [ ] Create GET /api/auth/session endpoint
- [ ] Implement JWT token generation
- [ ] Create session validation middleware
- [ ] Add secure cookie configuration
- [ ] Handle token expiration
- [ ] Test all auth endpoints
- [ ] Document authentication flow

---

## Acceptance Criteria

- [ ] Users can register with wallet address
- [ ] Users can login and receive session token
- [ ] Session token properly validates
- [ ] Protected routes require authentication
- [ ] Logout clears session
- [ ] Tokens expire appropriately
- [ ] Error messages are clear and secure

---

## Technical Notes

```typescript
// app/api/auth/login/route.ts
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { apiSuccess, apiError } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    // Verify wallet signature here (optional for MVP)

    // Find user
    const user = await prisma.user.findUnique({
      where: { walletAddress },
    });

    if (!user) {
      return apiError('User not found. Please register first.', 404);
    }

    // Create JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // Set cookie
    const response = apiSuccess({ user, token });
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    return apiError('Login failed', 500);
  }
}
```

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const protectedRoutes = ['/api/posts', '/api/entries', '/api/profile'];

  if (
    protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    const token = request.cookies.get('session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}
```

---

## Difficulty

🟠 Advanced
