# Commands

Complete reference of all built-in Grithub commands.

## Overview

Grithub commands are organized into categories:

- **Authentication** - Login, logout
- **Configuration** - Settings and preferences
- **Repository** - Default repository management
- **Issues** - Issue management and bulk operations
- **Information** - Display runtime info
- **Generation** - API command generation

## Command Structure

All commands follow this pattern:

```bash
grithub <command> [arguments] [options]
```

### Get Help

For any command:

```bash
grithub <command> --help
grithub <command> -h
```

List all commands:

```bash
grithub --help
grithub help
```

## Authentication Commands

### login

Authenticate with GitHub via OAuth.

```bash
grithub login
```

**What it does:**

1. Opens browser to GitHub OAuth
2. Stores authentication token
3. Prompts for default repository selection

**Example:**

```bash
$ grithub login
✓ Authentication successful
? Select default repository
❯ username/repo-1
  username/repo-2
✓ You have been logged in as Your Name!
```

### logout

Clear local authentication.

```bash
grithub logout
```

**What it does:**

1. Removes stored token
2. Clears user data
3. Keeps configuration settings

**Example:**

```bash
$ grithub logout
⠋ Logging out...
✓ Logged out successfully
```

## Configuration Commands

### config

Configure Grithub settings interactively.

```bash
grithub config
```

**Options:**

- Debug mode
- API base URL
- Timeout duration
- Command generation preferences
- Ngrok auth token
- Reset configuration

**Example:**

```bash
$ grithub config
? Select configuration to set
❯ Debug Mode (Disabled)
  API Base URL (https://api.github.com)
  Timeout Duration (3000 ms)
```

### set-repo

Set default repository context.

```bash
grithub set-repo [name] [options]
```

**Arguments:**

- `name` - Full repository name (owner/repo)

**Options:**

- `-O, --org` - Select from organization repositories

**Examples:**

```bash
# Direct specification
grithub set-repo toneflix/grithub

# Interactive selection
grithub set-repo

# From organization
grithub set-repo --org
```

## Information Commands

### info

Display application and system information.

```bash
grithub info
```

**Output includes:**

- App version
- Platform details
- User information
- Database location
- Default repository
- System resources

**Example:**

```bash
$ grithub info
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

## Issue Commands

### issues

Interactive issues management dashboard.

```bash
grithub issues [repo]
```

**Arguments:**

- `repo` (optional) - Repository name (owner/repo)

**Features:**

- Browse all issues with pagination
- View issue details
- Close/reopen issues
- Edit title or body
- Delete issues

**Example:**

```bash
$ grithub issues
✓ 15 issues fetched successfully.

? Select Issue
❯ #1: 🟢 Feature request
  #2: 🔴 Bug in login
  #3: 🟢 Documentation update
  Load more issues
```

### issues:create

Create a single issue (generated command).

```bash
grithub issues:create --title <title> [options]
```

**Options:**

- `--title` (required) - Issue title
- `--body` - Issue description
- `--owner` - Repository owner
- `--repo` - Repository name
- `--labels` - Comma-separated labels
- `--assignees` - Comma-separated assignees

**Example:**

```bash
grithub issues:create \
  --title "Add dark mode" \
  --body "Users requested dark mode" \
  --labels "enhancement,ui"
```

### issues:seed

Create multiple issues from markdown files.

```bash
grithub issues:seed <directory> [options]
```

**Arguments:**

- `directory` (required) - Path to markdown files

**Options:**

- `--repo` - Repository (uses default if not provided)

**Example:**

```bash
grithub issues:seed ./my-issues
```

### issues:update

Update issues from modified markdown files.

```bash
grithub issues:update <directory> [options]
```

**Arguments:**

- `directory` (required) - Path to markdown files

**Options:**

- `--repo` - Repository (uses default if not provided)

**Example:**

```bash
grithub issues:update ./my-issues
```

### issues:delete

Delete a range of issues.

```bash
grithub issues:delete --start <number> --end <number> [options]
```

**Options:**

- `--start` (required) - Starting issue number
- `--end` (required) - Ending issue number
- `--repo` - Repository (uses default if not provided)

**Example:**

```bash
grithub issues:delete --start 1 --end 50
```

::: danger
Issue deletion is permanent and cannot be undone.
:::

## Generation Commands

### generate:apis

Generate CLI commands from GitHub OpenAPI spec.

```bash
grithub generate:apis
```

**What it does:**

1. Downloads GitHub OpenAPI specification
2. Parses endpoint definitions
3. Generates command signatures
4. Writes to `.grithub/apis.generated.js` in your current working directory.

**Example:**

```bash
$ grithub generate:apis
✓ @octokit/openapi is already installed.
⠋ Generating Extended APIs...
✓ Generated Extended APIs to: .grithub/apis.generated.js
```

**Generated commands available after running:**

- All GitHub REST API endpoints
- Proper parameter validation
- Automatic documentation

## Generated Commands

After running `generate:apis`, hundreds of commands become available:

### Issues (Generated)

```bash
# List issues
grithub issues:list-for-repo --state open

# Get issue
grithub issues:get --issue_number 42

# Update issue
grithub issues:update --issue_number 42 --state closed

# Add labels
grithub issues:addLabels --issue_number 42 --labels "bug,priority"
```

### Repositories (Generated)

```bash
# List repos
grithub repos:list-for-authenticated-user --per_page 100

# Get repo
grithub repos:get --owner toneflix --repo grithub

# Create repo
grithub repos:create-for-authenticated-user \
  --name "new-repo" \
  --private false
```

### Pull Requests (Generated)

```bash
# List PRs
grithub pulls:list --state open

# Get PR
grithub pulls:get --pull_number 10

# Create PR
grithub pulls:create \
  --title "Fix bug" \
  --head "feature" \
  --base "main"

# Merge PR
grithub pulls:merge --pull_number 10 --merge_method squash
```

### Organizations (Generated)

```bash
# List orgs
grithub orgs:list-for-authenticated-user

# Get org
grithub orgs:get --org toneflix

# List members
grithub orgs:listMembers --org toneflix
```

### Users (Generated)

```bash
# Get authenticated user
grithub users:get-authenticated

# Get user
grithub users:getByUsername --username toneflix

# List followers
grithub users:listFollowersForAuthenticatedUser
```

## Command Patterns

### Using Default Repository

After setting default repository:

```bash
# Set default
grithub set-repo owner/repo

# Now these work without --owner/--repo
grithub issues:create --title "Bug"
grithub issues:list-for-repo --state open
grithub pulls:list
```

### Piping and Scripting

```bash
# Export to file
grithub issues:list-for-repo > issues.json

# Use with jq
grithub issues:list-for-repo | jq '.[] | .title'

# In scripts
#!/bin/bash
for title in "Task 1" "Task 2"; do
  grithub issues:create --title "$title"
done
```

### Chaining Commands

```bash
# Setup and use
grithub login && \
grithub set-repo owner/repo && \
grithub issues:seed ./issues
```

## Global Options

Available on all commands:

### Help

```bash
grithub <command> --help
grithub <command> -h
```

### Version

```bash
grithub --version
grithub -V
```

## Exit Codes

Grithub uses standard exit codes:

- `0` - Success
- `1` - General error
- `2` - Misuse of command
- `130` - Interrupted (Ctrl+C)

**Example usage:**

```bash
#!/bin/bash
grithub issues:create --title "Bug"
if [ $? -eq 0 ]; then
  echo "Issue created successfully"
else
  echo "Failed to create issue"
  exit 1
fi
```

## Command Aliases

Some commands have shorter aliases:

```bash
# issues:list-for-repo can use alias
grithub issues:list

# issues:get has alias
grithub issues:get
```

## Tips and Tricks

### Shell Aliases

Create shortcuts:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias gi='grithub issues'
alias gic='grithub issues:create'
alias gil='grithub issues:list-for-repo'

# Usage
gi  # Opens interactive dashboard
gic --title "Bug"  # Creates issue
gil --state open  # Lists open issues
```

### Command History

Use shell history effectively:

```bash
# Search history
Ctrl+R grithub

# Repeat last grithub command
!grithub

# Edit and repeat
grithub issues:create --title "Bug 1"
# Press Up, change "1" to "2", Enter
```

### Tab Completion

Enable tab completion (if supported):

```bash
grithub iss<Tab>  # Completes to "issues"
grithub issues:cr<Tab>  # Completes to "issues:create"
```

## Troubleshooting Commands

### Command Not Found

```bash
command not found: grithub
```

**Solution:**

```bash
# Reinstall globally
npm install -g @toneflix/grithub

# Or use npx
npx @toneflix/grithub <command>
```

### Permission Denied

```bash
ERROR: You're not signed in
```

**Solution:**

```bash
grithub login
```

### Invalid Arguments

```bash
ERROR: Missing required argument: title
```

**Solution:**

```bash
# Check required parameters
grithub <command> --help

# Provide required arguments
grithub issues:create --title "My Issue"
```

## Next Steps

- [API Reference](/api/issues) - Detailed API documentation
- [Bulk Operations](/guide/bulk-operations) - Advanced workflows
