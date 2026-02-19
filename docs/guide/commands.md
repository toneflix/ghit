# Commands

Complete reference of all built-in Ghit commands.

## Overview

Ghit commands are organized into categories:

- **Authentication** - Login, logout
- **Configuration** - Settings and preferences
- **Repository** - Default repository management
- **Issues** - Issue management and bulk operations
- **Information** - Display runtime info
- **Generation** - API command generation

## Command Structure

All commands follow this pattern:

```bash
ghit <command> [arguments] [options]
```

### Get Help

For any command:

```bash
ghit <command> --help
ghit <command> -h
```

List all commands:

```bash
ghit --help
ghit help
```

## Authentication Commands

### login

Authenticate with GitHub via OAuth.

```bash
ghit login
```

**What it does:**

1. Opens browser to GitHub OAuth
2. Stores authentication token
3. Prompts for default repository selection

**Example:**

```bash
$ ghit login
✓ Authentication successful
? Select default repository
❯ username/repo-1
  username/repo-2
✓ You have been logged in as Your Name!
```

### logout

Clear local authentication.

```bash
ghit logout
```

**What it does:**

1. Removes stored token
2. Clears user data
3. Keeps configuration settings

**Example:**

```bash
$ ghit logout
⠋ Logging out...
✓ Logged out successfully
```

## Configuration Commands

### config

Configure Ghit settings interactively.

```bash
ghit config
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
$ ghit config
? Select configuration to set
❯ Debug Mode (Disabled)
  API Base URL (https://api.github.com)
  Timeout Duration (3000 ms)
```

### set-repo

Set default repository context.

```bash
ghit set-repo [name] [options]
```

**Arguments:**

- `name` - Full repository name (owner/repo)

**Options:**

- `-O, --org` - Select from organization repositories

**Examples:**

```bash
# Direct specification
ghit set-repo toneflix/ghit

# Interactive selection
ghit set-repo

# From organization
ghit set-repo --org
```

## Information Commands

### info

Display application and system information.

```bash
ghit info
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
$ ghit info
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
ghit issues [repo]
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
$ ghit issues
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
ghit issues:create --title <title> [options]
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
ghit issues:create \
  --title "Add dark mode" \
  --body "Users requested dark mode" \
  --labels "enhancement,ui"
```

### issues:seed

Create multiple issues from markdown files.

```bash
ghit issues:seed <directory> [options]
```

**Arguments:**

- `directory` (required) - Path to markdown files

**Options:**

- `--repo` - Repository (uses default if not provided)

**Example:**

```bash
ghit issues:seed ./my-issues
```

### issues:update

Update issues from modified markdown files.

```bash
ghit issues:update <directory> [options]
```

**Arguments:**

- `directory` (required) - Path to markdown files

**Options:**

- `--repo` - Repository (uses default if not provided)

**Example:**

```bash
ghit issues:update ./my-issues
```

### issues:delete

Delete a range of issues.

```bash
ghit issues:delete --start <number> --end <number> [options]
```

**Options:**

- `--start` (required) - Starting issue number
- `--end` (required) - Ending issue number
- `--repo` - Repository (uses default if not provided)

**Example:**

```bash
ghit issues:delete --start 1 --end 50
```

::: danger
Issue deletion is permanent and cannot be undone.
:::

### issues:download

Download issues from a specified repository.

```bash
ghit issues:download <owner/repo> <target-directory> [options]
```

**Options:**

- `--labeled` Comma-separated list of labels to filter issues by. Only issues with at least one of these labels will be downloaded.
- `--dry-run` Simulate the download without actually saving issues

### issues:clone

Clone issues from a specified repository to the default repository or a custom one.

```bash
ghit issues:clone <owner/repo> <target-repo> [options]
```

**Options:**

- `--labeled` Comma-separated list of labels to filter issues by. Only issues with at least one of these labels will be cloned.
- `--dry-run` Simulate the cloning without actually cloning issues.
- `--labels` Comma-separated list of labels to add to cloned issues. If not provided, original labels will be retained.

## Generation Commands

### generate:apis

Generate CLI commands from GitHub OpenAPI spec.

```bash
ghit generate:apis
```

**What it does:**

1. Downloads GitHub OpenAPI specification
2. Parses endpoint definitions
3. Generates command signatures
4. Writes to `.ghit/apis.generated.js` in your current working directory.

**Example:**

```bash
$ ghit generate:apis
✓ @octokit/openapi is already installed.
⠋ Generating Extended APIs...
✓ Generated Extended APIs to: .ghit/apis.generated.js
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
ghit issues:list-for-repo --state open

# Get issue
ghit issues:get --issue_number 42

# Update issue
ghit issues:update --issue_number 42 --state closed

# Add labels
ghit issues:addLabels --issue_number 42 --labels "bug,priority"
```

### Repositories (Generated)

```bash
# List repos
ghit repos:list-for-authenticated-user --per_page 100

# Get repo
ghit repos:get --owner toneflix --repo ghit

# Create repo
ghit repos:create-for-authenticated-user \
  --name "new-repo" \
  --private false
```

### Pull Requests (Generated)

```bash
# List PRs
ghit pulls:list --state open

# Get PR
ghit pulls:get --pull_number 10

# Create PR
ghit pulls:create \
  --title "Fix bug" \
  --head "feature" \
  --base "main"

# Merge PR
ghit pulls:merge --pull_number 10 --merge_method squash
```

### Organizations (Generated)

```bash
# List orgs
ghit orgs:list-for-authenticated-user

# Get org
ghit orgs:get --org toneflix

# List members
ghit orgs:listMembers --org toneflix
```

### Users (Generated)

```bash
# Get authenticated user
ghit users:get-authenticated

# Get user
ghit users:getByUsername --username toneflix

# List followers
ghit users:listFollowersForAuthenticatedUser
```

## Command Patterns

### Using Default Repository

After setting default repository:

```bash
# Set default
ghit set-repo owner/repo

# Now these work without --owner/--repo
ghit issues:create --title "Bug"
ghit issues:list-for-repo --state open
ghit pulls:list
```

### Piping and Scripting

```bash
# Export to file
ghit issues:list-for-repo > issues.json

# Use with jq
ghit issues:list-for-repo | jq '.[] | .title'

# In scripts
#!/bin/bash
for title in "Task 1" "Task 2"; do
  ghit issues:create --title "$title"
done
```

### Chaining Commands

```bash
# Setup and use
ghit login && \
ghit set-repo owner/repo && \
ghit issues:seed ./issues
```

## Global Options

Available on all commands:

### Help

```bash
ghit <command> --help
ghit <command> -h
```

### Version

```bash
ghit --version
ghit -V
```

## Exit Codes

Ghit uses standard exit codes:

- `0` - Success
- `1` - General error
- `2` - Misuse of command
- `130` - Interrupted (Ctrl+C)

**Example usage:**

```bash
#!/bin/bash
ghit issues:create --title "Bug"
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
ghit issues:list

# issues:get has alias
ghit issues:get
```

## Tips and Tricks

### Shell Aliases

Create shortcuts:

```bash
# Add to ~/.bashrc or ~/.zshrc
alias gi='ghit issues'
alias gic='ghit issues:create'
alias gil='ghit issues:list-for-repo'

# Usage
gi  # Opens interactive dashboard
gic --title "Bug"  # Creates issue
gil --state open  # Lists open issues
```

### Command History

Use shell history effectively:

```bash
# Search history
Ctrl+R ghit

# Repeat last ghit command
!ghit

# Edit and repeat
ghit issues:create --title "Bug 1"
# Press Up, change "1" to "2", Enter
```

### Tab Completion

Enable tab completion (if supported):

```bash
ghit iss<Tab>  # Completes to "issues"
ghit issues:cr<Tab>  # Completes to "issues:create"
```

## Troubleshooting Commands

### Command Not Found

```bash
command not found: ghit
```

**Solution:**

```bash
# Reinstall globally
npm install -g ghit

# Or use npx
npx ghit <command>
```

### Permission Denied

```bash
ERROR: You're not signed in
```

**Solution:**

```bash
ghit login
```

### Invalid Arguments

```bash
ERROR: Missing required argument: title
```

**Solution:**

```bash
# Check required parameters
ghit <command> --help

# Provide required arguments
ghit issues:create --title "My Issue"
```

## Next Steps

- [API Reference](/api/issues) - Detailed API documentation
- [Bulk Operations](/guide/bulk-operations) - Advanced workflows
