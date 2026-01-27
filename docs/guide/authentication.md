# Authentication

Grithub uses GitHub OAuth for secure authentication, storing your credentials locally for persistent access.

## Overview

Authentication in Grithub:

- Uses GitHub's OAuth flow
- Stores token locally in SQLite database
- Supports personal access tokens
- Automatically includes token in all API requests

## Login Process

### Interactive Login

The simplest way to authenticate:

```bash
grithub login
```

This will:

1. Open your default browser
2. Redirect to GitHub's OAuth authorization page
3. Request necessary permissions
4. Redirect back with authorization code
5. Exchange code for access token
6. Store token securely
7. Prompt you to select a default repository

### What Happens During Login

```bash
$ grithub login

Please open the following URL in your browser to authenticate: https://github.com/login/device
Press Enter to open your browser, or  Ctrl+C  to cancel

✔ Authorization successful

? Select default repository
❯ 3m1n3nc3/3m1n3nc3
  3m1n3nc3/AISAPI
  3m1n3nc3/Alisimbi
  3m1n3nc3/alisimbiPhp
  3m1n3nc3/awesome-php
  3m1n3nc3/bahin-markpoint
  3m1n3nc3/Breeze-Investment

↑↓ navigate • ⏎ select
```

## Required Permissions

Grithub requests these OAuth scopes:

- `repo` - Full control of private repositories
  - Read and write access to code
  - Read and write access to issues
  - Read and write access to pull requests
- `user` - Read user profile data
- `write:org` - Read and write org and team membership (optional)

::: info
You can review and revoke access anytime at [GitHub Settings → Applications](https://github.com/settings/applications).
:::

## Token Storage

### Location

Tokens are stored in an SQLite database that contains:

- Authentication token
- User profile information
- Default repository settings
- Configuration preferences

### Security

- Database file has restricted permissions (user-only access)
- Tokens are stored as-is (not encrypted in database)
- File system permissions protect the token
- Never committed to version control

## Checking Authentication Status

Verify you're logged in:

```bash
grithub info
```

Output includes:

```bash
✓ Application Information Loaded.

┌─────────────────────-───┬──────────────────────────┐
│ Key                     │ Value                    │
├──────────────────────-──┼──────────────────────────┤
│ App Version             │ 0.1.6                    │
│ Platform                │ darwin                   │
│ CPUs                    │ 8                        │
│ Host                    │ username@Machine.host    │
│ Github User             │ youruser (ID: xxxxxxxx)  │
│ Default Repo            │ toneflix-forks/dummy     │
└───────────────────────-─┴──────────────────────────┘
```

## Logout

Revoke local access:

```bash
grithub logout
```

This will:

1. Clear stored token from database
2. Remove user profile data
3. Keep configuration settings
4. Preserve default repository preference

::: tip
Logout only removes local credentials. To fully revoke access, also revoke the OAuth app at [GitHub Settings](https://github.com/settings/applications).
:::

## Re-authentication

If your token expires or is revoked:

```bash
# You'll see authentication errors
ERROR: You're not signed in, please run the [login] command

# Simply login again
grithub logout
grithub login
```

## Personal Access Tokens (Alternative)

For CI/CD or automated workflows, use personal access tokens:

### Generate Token

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `user`, `write:org`
4. Generate and copy token

### Use Token

Set as environment variable:

```bash
export GITHUB_TOKEN="ghp_your_token_here"
grithub issues:list
```

Or configure directly:

```bash
grithub config
# Select "Token" option
# Paste your token
```

## Multiple Accounts

To switch between GitHub accounts:

```bash
# Logout of current account
grithub logout

# Login with different account
grithub login
```

::: info
Grithub doesn't support multiple simultaneous accounts. You must logout and re-login to switch.
:::

## Authentication in Scripts

For automated scripts:

### Option 1: Environment Variable

```bash
#!/bin/bash
export GITHUB_TOKEN="$YOUR_TOKEN"
grithub issues:create --title "Automated issue"
```

### Option 2: Pre-authenticated Session

```bash
#!/bin/bash
# Login once
grithub login

# Run multiple commands
grithub issues:create --title "Issue 1"
grithub issues:create --title "Issue 2"
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Create Issue

on:
  workflow_dispatch:

jobs:
  create:
    runs-on: ubuntu-latest
    steps:
      - name: Install Grithub
        run: npm install -g @toneflix/grithub

      - name: Create Issue
        run: grithub issues:create --title "Automated"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Other CI Platforms

```bash
# Set token from CI secrets
export GITHUB_TOKEN="$CI_GITHUB_TOKEN"

# Run commands
grithub issues:seed ./issues
```

## Troubleshooting

### "Not signed in" Error

```bash
ERROR: You're not signed in, please run the [login] command
```

**Solution:**

```bash
grithub login
```

### "Token expired" Error

**Solution:**

```bash
grithub logout
grithub login
```

### "Insufficient permissions" Error

**Solution:**

1. Logout: `grithub logout`
2. Revoke app at [GitHub Settings](https://github.com/settings/applications)
3. Login again: `grithub login` (re-authorize with required scopes)

### Browser Doesn't Open

**Solution:**

Manually copy the URL from terminal:

```bash
$ grithub login
Opening browser to: https://github.com/login/oauth/authorize?...

# Copy URL and paste in browser
```

### Database Locked Error

**Solution:**

Ensure no other Grithub instances are running:

```bash
# Check for running processes
ps aux | grep grithub

# Kill if needed
kill -9 <PID>

# Try again
grithub login
```

## Security Best Practices

### Protect Your Token

- Never commit tokens to version control
- Use environment variables in shared scripts
- Regularly rotate tokens

### Limit Token Scope

Only grant necessary permissions:

- Personal projects: `repo` scope only
- Organization work: Add `write:org`
- Public repos only: Use `public_repo` instead of `repo`

### Audit Token Usage

Regularly review:

1. [GitHub Settings → Applications](https://github.com/settings/applications)
2. Check last used date
3. Revoke unused tokens
4. Regenerate if suspicious activity

### Use Different Tokens

- Personal computer: OAuth flow
- CI/CD: Dedicated personal access token
- Shared servers: Service account tokens

## Next Steps

- [Configuration](/guide/configuration) - Customize Grithub settings
- [Commands](/guide/commands) - Learn available commands
- [Quick Start](/guide/quick-start) - Start using authenticated features
