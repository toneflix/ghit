# Getting Started

This guide will walk you through installing Grithub and setting up your first workflow.

## Installation

Install Grithub globally using your preferred package manager:

::: code-group

```bash [pnpm]
pnpm add -g @toneflix/grithub
```

```bash [npm]
npm install -g @toneflix/grithub
```

```bash [yarn]
yarn global add @toneflix/grithub
```

:::

## First Steps

### 1. Authenticate with GitHub

Run the login command to authenticate:

```bash
grithub login
```

This will:

- Open your browser to GitHub's OAuth flow
- Request necessary permissions
- Store your token securely in `~/.grithub/db.sqlite`

### 2. Set a Default Repository

Set a default repository to avoid typing owner/repo on every command:

```bash
grithub set-repo owner/repository-name
```

For example:

```bash
grithub set-repo toneflix/grithub
```

### 3. Verify Your Setup

Check that everything is configured correctly:

```bash
grithub info
```

This displays:

- Your authentication status
- Current default repository
- Configuration details

## Working with Issues

### Interactive Mode

Launch the interactive issues dashboard:

```bash
grithub issues
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
grithub issues:create --title "Bug: Login fails" --body "Description here"
```

### Bulk Operations

Seed multiple issues from a directory of markdown files:

```bash
grithub issues:seed ./issues-directory
```

Update existing issues:

```bash
grithub issues:update ./issues-directory
```

Delete multiple issues:

```bash
grithub issues:delete --start 1 --end 50
```

## Generated API Commands

Grithub can generate commands directly from GitHub's OpenAPI specification.

### Generate Commands

Run the generator once:

```bash
grithub generate:apis
```

This creates `.grithub/apis.generated.js` containing all GitHub REST API endpoints as CLI commands.

### Using Generated Commands

Once generated, use any GitHub API endpoint as a command:

```bash
# Create an issue
grithub issues:create --title "New feature" --owner org --repo repo

# List repository issues
grithub issues:list --owner org --repo repo --state open

# Get a specific issue
grithub issues:get --owner org --repo repo --issue_number 42

# List organizations
grithub orgs:list-for-authenticated-user --per_page 50
```

::: tip
The generated file is ignored by git (add `.grithub/` to `.gitignore`). Regenerate when GitHub's API updates.
:::

## Configuration

View or modify configuration:

```bash
grithub config
```

Available options:

- `debug` — Enable detailed error messages
- `token` — Your GitHub personal access token
- `default_repo` — Default repository context

## Next Steps

- [Quick Start Guide](/guide/quick-start) for common workflows
- [Commands Reference](/guide/commands) for all available commands
- [API Documentation](/api/issues) for generated command details
