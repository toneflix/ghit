# Getting Started

This guide will walk you through installing Ghit and setting up your first workflow.

## Installation

Install Ghit globally using your preferred package manager:

::: code-group

```bash [pnpm]
pnpm add -g @toneflix/ghit
```

```bash [npm]
npm install -g @toneflix/ghit
```

```bash [yarn]
yarn global add @toneflix/ghit
```

:::

## First Steps

### 1. Authenticate with GitHub

Run the login command to authenticate:

```bash
ghit login
```

This will:

- Open your browser to GitHub's OAuth flow
- Request necessary permissions
- Store your token securely in `~/.ghit/db.sqlite`

### 2. Set a Default Repository

Set a default repository to avoid typing owner/repo on every command:

```bash
ghit set-repo owner/repository-name
```

For example:

```bash
ghit set-repo toneflix/ghit
```

### 3. Verify Your Setup

Check that everything is configured correctly:

```bash
ghit info
```

This displays:

- Your authentication status
- Current default repository
- Configuration details

## Working with Issues

### Interactive Mode

Launch the interactive issues dashboard:

```bash
ghit issues
```

This lets you:

- Browse all issues in your repository
- View detailed information
- Close or reopen issues
- Edit titles and descriptions
- Delete issues

### Creating Issues

Create a single issue:

```bash
ghit issues:create --title "Bug: Login fails" --body "Description here"
```

### Bulk Operations

Seed multiple issues from a directory of markdown files:

```bash
ghit issues:seed ./issues-directory
```

Update existing issues:

```bash
ghit issues:update ./issues-directory
```

Delete multiple issues:

```bash
ghit issues:delete --start 1 --end 50
```

## Generated API Commands

Ghit can generate commands directly from GitHub's OpenAPI specification.

### Generate Commands

Run the generator once:

```bash
ghit generate:apis
```

This creates `.ghit/apis.generated.js` containing all GitHub REST API endpoints as CLI commands.

### Using Generated Commands

Once generated, use any GitHub API endpoint as a command:

```bash
# Create an issue
ghit issues:create --title "New feature" --owner org --repo repo

# List repository issues
ghit issues:list --owner org --repo repo --state open

# Get a specific issue
ghit issues:get --owner org --repo repo --issue_number 42

# List organizations
ghit orgs:list-for-authenticated-user --per_page 50
```

::: tip
The generated file is ignored by git (add `.ghit/` to `.gitignore`). Regenerate when GitHub's API updates.
:::

## Configuration

View or modify configuration:

```bash
ghit config
```

Available options:

- `debug` — Enable detailed error messages
- `token` — Your GitHub personal access token
- `default_repo` — Default repository context

## Next Steps

- [Quick Start Guide](/guide/quick-start) for common workflows
- [Commands Reference](/guide/commands) for all available commands
- [API Documentation](/api/issues) for generated command details
