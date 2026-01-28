# Issues API

Commands for managing GitHub issues.

## Interactive Issues Dashboard

Launch an interactive interface for managing issues.

```bash
ghit issues [repo]
```

### Arguments

- `repo` (optional) - Full repository name (e.g., `owner/repo`). Uses default repo if not provided.

### Features

- Browse all repository issues with pagination
- View detailed issue information
- Close or reopen issues
- Edit issue title or body
- Delete issues
- Load more issues dynamically

### Example

```bash
# Use default repository
ghit issues

# Specify repository
ghit issues toneflix/ghit
```

## Seed Issues

Create multiple issues from markdown files.

```bash
ghit issues:seed <directory> [options]
```

### Arguments

- `directory` (optional, defaults to `issues`) - Path to directory containing markdown files

### Options

- `--repo` - Repository (uses default if not provided)

### Markdown File Format

Each `.md` file represents one issue:

```markdown
---
type: Issue Type (Feature, Task, Bug)
title: Issue Title
labels: ['bug', 'priority']
assignees: ['username1', 'username2']
---

Issue body content goes here.

Can include multiple paragraphs and **formatting**.
```

### Example

```bash
ghit issues:seed ./my-issues
```

## Update Issues

Update existing issues based on markdown files.

```bash
ghit issues:update <directory> [options]
```

### Arguments

- `directory` (required) - Path to directory containing markdown files

### Options

- `--repo` - Repository (uses default if not provided)

### How It Works

- Compares markdown files against existing issues
- Uses smart diffing to detect changes
- Updates only modified content
- Preserves unchanged fields

### Example

```bash
ghit issues:update ./my-issues
```

## Delete Issues

Interactively delete issues permanently with multi select support.

```bash
ghit issues:delete <repo>
```

### Arguments

- `repo` - Repository (uses default if not provided)

### Example

```bash
# Delete issues 1-50
ghit issues:delete

# Delete issues in specific repo
ghit issues:delete owner/repo
```

::: warning
This action is irreversible. Deleted issues cannot be recovered. You can add the `--dry-run` flag to see what will be deleted.
:::

## Generated Commands

After running `ghit generate:apis`, additional issue commands become available from the Github OpenAPI Spec:

### List Repository Issues

```bash
ghit issues:list-for-repo [options]
```

#### Options

- `--owner` - Repository owner
- `--repo` - Repository name
- `--state` - Filter by state (`open`, `closed`, `all`)
- `--labels` - Filter by labels
- `--sort` - Sort field (`created`, `updated`, `comments`)
- `--direction` - Sort direction (`asc`, `desc`)
- `--since` - Only issues updated after this time (ISO 8601)
- `--per_page` - Results per page (max 100)
- `--page` - Page number

#### Example

```bash
ghit issues:list-for-repo \
  --owner toneflix \
  --repo ghit \
  --state open \
  --labels bug \
  --per_page 50
```

### Get Single Issue

```bash
ghit issues:get --issue_number <number> [options]
```

#### Options

- `--owner` - Repository owner
- `--repo` - Repository name
- `--issue_number` (required) - Issue number

#### Example

```bash
ghit issues:get --owner toneflix --repo ghit --issue_number 42
```

### Add Labels

```bash
ghit issues:addLabels --issue_number <number> --labels <labels> [options]
```

#### Options

- `--owner` - Repository owner
- `--repo` - Repository name
- `--issue_number` (required) - Issue number
- `--labels` (required) - Array of label names

#### Example

```bash
ghit issues:addLabels \
  --issue_number 42 \
  --labels "bug,priority" \
  --owner toneflix \
  --repo ghit
```

### Update Issue

```bash
ghit issues:update --issue_number <number> [options]
```

#### Options

- `--owner` - Repository owner
- `--repo` - Repository name
- `--issue_number` (required) - Issue number
- `--title` - New title
- `--body` - New body
- `--state` - New state (`open`, `closed`)
- `--labels` - New labels array
- `--assignees` - New assignees array

#### Example

```bash
ghit issues:update \
  --issue_number 42 \
  --title "Updated title" \
  --state closed \
  --owner toneflix \
  --repo ghit
```

## Best Practices

### Using Default Repository

Set a default repository to avoid repeating `--owner` and `--repo`:

```bash
ghit set-repo toneflix/ghit
ghit issues:create --title "Bug fix"
```

### Bulk Operations

For creating many issues, use the seeder:

1. Create markdown files in a directory
2. Run `ghit issues:seed ./directory`
3. Track changes in git
4. Update with `ghit issues:update ./directory`

### Labels and Assignees

Define labels in frontmatter for consistency:

```markdown
---
title: Feature Request
labels: ['enhancement', 'good first issue']
assignees: ['maintainer']
---
```

### Error Handling

Enable debug mode for detailed error messages:

```bash
ghit config --debug true
```
