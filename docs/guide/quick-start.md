# Quick Start

Get up and running with Grithub in under 5 minutes.

## Install

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

## Authenticate

```bash
grithub login
```

Follow the browser OAuth flow to grant access.

## Set Default Repository

```bash
grithub set-repo owner/repo
```

## Common Workflows

### Browse Issues Interactively

```bash
grithub issues
```

Navigate through issues, view details, close/reopen, edit, or delete.

### Create a Single Issue

```bash
grithub issues:create --title "Bug found" --body "Description"
```

### Seed Multiple Issues

Create a directory with markdown files (one per issue):

```md
issues/
├── 001-setup-ci.md
├── 002-add-tests.md
└── 003-update-docs.md
```

Each file:

```markdown
---
type: Issue Type (Feature, Task, Bug)
title: Setup CI Pipeline
labels: ['enhancement', 'ci']
assignees: ['username']
---

Add GitHub Actions workflow for automated testing.
```

Then seed:

```bash
grithub issues:seed ./issues
```

### Update Issues in Bulk

Modify your markdown files, then:

```bash
grithub issues:update ./issues
```

Grithub uses smart diffing to update only changed content.

### Delete Issues

Interactively multiselcet and delte issues

```bash
grithub issues:delete
```

## Generated Commands

Generate CLI commands from GitHub's OpenAPI spec:

```bash
grithub generate:apis
```

Now use any GitHub REST endpoint:

```bash
# List repos for authenticated user
grithub repos:list-for-authenticated-user --per_page 100

# Create a gist
grithub gists:create --description "My snippet" --public true

# Get user info
grithub users:get-authenticated
```

::: tip Command Discovery
Run `grithub --help` to see all available commands, including generated ones and their expected options and arguments.
:::

## Configuration Tips

### Check Current Config

```bash
grithub info
```

### Enable Debug Mode

```bash
grithub config --debug true
```

### Switch Repositories Quickly

```bash
grithub set-repo different-owner/different-repo
```

## Next Steps

- [Getting Started Guide](/guide/getting-started) for detailed setup
- [Commands Reference](/guide/commands) for all command options
