# Configuration

Customize Ghit's behavior through the interactive configuration interface or direct database access.

## Overview

Ghit stores configuration includes:

- Debug mode
- API settings
- Default repository
- Timeout preferences
- Ngrok Auth Token
- Command generation options

## Configuration Command

Access the interactive configuration:

```bash
ghit config
```

You'll see:

```bash
? Select configuration to set
❯ Debug Mode
  API Base URL
  Timeout Duration
  Skip Long Command Generation
  Ngrok Auth Token
  Reset Configuration

Enable or disable debug mode (Disabled)
↑↓ navigate • ⏎ select
```

## Configuration Options

### Debug Mode

Enable detailed error messages and logging.

```bash
ghit config
# Select "Debug Mode"
# Toggle enabled/disabled
```

**When enabled:**

- Full error stack traces
- Detailed API request/response logs
- Verbose operation output

**When disabled:**

- Clean error messages
- Minimal output
- Production-ready logging

**Example:**

```bash
# Debug disabled
ERROR: An error occurred

# Debug enabled
ERROR: An error occurred
Stack trace:
  at Object.<anonymous> (/path/to/file.ts:123:45)
  at Module._compile (node:internal/modules/cjs/loader:1246:14)
  ...
```

### API Base URL

Set the GitHub API base URL.

**Default:** `https://api.github.com`

**Use cases:**

- GitHub Enterprise Server
- API proxy/gateway
- Testing against mock servers

**Example:**

```bash
ghit config
# Select "API Base URL"
# Enter: https://github.company.com/api/v3
```

::: warning
For GitHub.com, always use the default `https://api.github.com`.
:::

### Timeout Duration

Set request timeout in milliseconds.

**Default:** `3000` (3 seconds)

**Recommended values:**

- Fast networks: `3000-5000`
- Slow/unstable networks: `10000-30000`
- Enterprise/VPN: `15000-60000`

**Example:**

```bash
ghit config
# Select "Timeout Duration"
# Enter: 10000
```

### Skip Long Command Generation

Control whether to skip generating commands with many parameters.

**Default:** `Enabled`

**When enabled:**

- Faster `generate:apis` execution
- Skips endpoints with 20+ parameters or very long names
- Reduces generated file size

**When disabled:**

- Complete API coverage
- Slower generation
- Larger generated file

**Example:**

```bash
ghit config
# Select "Skip Long Command Generation"
# Toggle enabled/disabled
```

### Ngrok Auth Token

Set Ngrok authentication token for webhook testing.

**Example:**

```bash
ghit config
# Select "Ngrok Auth Token"
# Enter your token: 2abc...
```

**Alternative:** Set via environment variable

```bash
export NGROK_AUTHTOKEN="your_token_here"
```

### Reset Configuration

Restore all settings to defaults.

```bash
ghit config
# Select "Reset Configuration"
# Confirm reset
```

This resets:

- Debug mode → `false`
- API Base URL → `https://api.github.com`
- Timeout Duration → `3000`
- Skip Long Command Generation → `true`
- Ngrok Auth Token → `undefined`

::: danger
Reset does NOT clear authentication token or default repository.
:::

## Default Repository

Set your default repository context.

### Set Default Repository

```bash
ghit set-repo owner/repository
```

**Examples:**

```bash
# Direct specification
ghit set-repo toneflix/ghit

# Interactive selection from your repos
ghit set-repo

# From organization repos
ghit set-repo --org
```

### Benefits

Once set, omit `--owner` and `--repo` flags:

```bash
# Before (without default)
ghit issues:create --title "Bug" --owner toneflix --repo ghit

# After (with default)
ghit issues:create --title "Bug"
```

### Change Default Repository

```bash
# Set new default
ghit set-repo different-owner/different-repo

# Or interactively
ghit set-repo
```

## Viewing Current Configuration

Display all settings:

```bash
ghit info
```

Output includes:

```bash
┌─────────────────────-───┬──────────────────────────┐
│ Key                     │ Value                    │
├──────────────────────-──┼──────────────────────────┤
│ App Version             │ 0.1.6                    │
│ Platform                │ darwin                   │
│ CPUs                    │ 8                        │
│ Host                    │ username@Machine.host    │
│ Database Path           │ ~/.ghit/app.db        │
│ Github User             │ youruser (ID: xxxxxxxx)  │
│ Default Repo            │ toneflix-forks/dummy     │
└───────────────────────-─┴──────────────────────────┘
```

## Environment Variables

Override configuration via environment variables:

### GitHub Token

```bash
export GITHUB_TOKEN="ghp_your_token_here"
ghit issues:list
```

### API Base URL

```bash
export GITHUB_API_URL="https://github.company.com/api/v3"
ghit issues:list
```

### Ngrok Token

```bash
export NGROK_AUTHTOKEN="your_ngrok_token"
ghit webhook:listen
```

### Debug Mode

```bash
export GHIT_DEBUG=true
ghit issues:create --title "Test"
```

::: tip
Environment variables take precedence over database configuration.
:::

## Configuration File Location

All configuration is stored in SQLite:

```md
~/.ghit/
└── app.db
```

### Backup Configuration

```bash
cp ~/.ghit/app.db ~/.ghit/app.db.backup
```

### Restore Configuration

```bash
cp ~/.ghit/app.db.backup ~/.ghit/app.db
```

### Transfer to Another Machine

```bash
# On old machine
cp ~/.ghit/app.db /path/to/usb/ghit-config.db

# On new machine
mkdir -p ~/.ghit
cp /path/to/usb/ghit-config.db ~/.ghit/app.db
```

## Common Configuration Scenarios

### Development Environment

```bash
ghit config
# Enable debug mode
# Set shorter timeout (3000ms)
# Enable long command generation
```

### Production/CI Environment

```bash
ghit config
# Disable debug mode
# Set longer timeout (10000ms)
# Skip long command generation

# Use environment variables for token
export GITHUB_TOKEN="$CI_SECRET_TOKEN"
```

### GitHub Enterprise

```bash
ghit config
# Set API Base URL to your GHE instance
# Increase timeout (enterprise networks)
# Enable debug for troubleshooting
```

### Slow/Unstable Network

```bash
ghit config
# Increase timeout to 30000ms
# Enable debug to see retry attempts
```

## Troubleshooting

### Configuration Not Persisting

**Problem:** Changes don't persist after restart

**Solution:**

1. Check database permissions:

   ```bash
   ls -la ~/.ghit/app.db
   chmod 600 ~/.ghit/app.db
   ```

2. Verify database isn't locked:
   ```bash
   lsof ~/.ghit/app.db
   ```

### Timeout Errors

**Problem:** Requests timing out

**Solution:**

```bash
ghit config
# Increase timeout duration to 10000 or higher
```

### GitHub Enterprise Issues

**Problem:** Commands fail with GHE

**Solution:**

```bash
ghit config
# Set correct API Base URL
# Format: https://github.company.com/api/v3
# Enable debug mode
```

### Reset Everything

**Problem:** Configuration corrupted

**Solution:**

```bash
# Remove database
rm ~/.ghit/app.db

# Re-login
ghit login

# Reconfigure
ghit config
```

## Best Practices

### Version Control

**Don't commit:**

```gitignore
# .gitignore
.ghit/
*.db
```

**Do document:**

```markdown
# README.md

## Required Configuration

1. Run `ghit login`
2. Run `ghit set-repo owner/repo`
3. Set debug mode if needed
```

### Team Settings

For consistent team configuration:

```bash
# scripts/setup-ghit.sh
#!/bin/bash

ghit login
ghit set-repo company/project
ghit config # Then manually set team standards
```

### CI/CD Settings

Always use environment variables in CI:

```yaml
# .github/workflows/ghit.yml
env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  GITHUB_API_URL: ${{ secrets.GHE_API_URL }}
  GHIT_DEBUG: false
```

## Next Steps

- [Authentication](/guide/authentication) - Set up login
- [Commands](/guide/commands) - Available commands
- [Quick Start](/guide/quick-start) - Start using Ghit
