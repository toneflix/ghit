# Using Generated APIs

Grithub can automatically generate CLI commands from GitHub's OpenAPI specification, giving you access to the entire GitHub REST API surface without manual implementation.

## Overview

Generated commands provide:

- **Complete API Coverage** - Access all GitHub REST endpoints
- **Type-safe** - Commands include parameter validation
- **Consistent** - Same patterns across all endpoints

## Generating Commands

Run the generator to create `.grithub/apis.generated.js`:

```bash
grithub generate:apis
```

This process:

1. Downloads GitHub's OpenAPI specification
2. Parses all endpoint definitions
3. Generates CLI commands with proper signatures
4. Writes output to `.grithub/apis.generated.js` in your current working directory.

::: tip
Add `.grithub/` to your `.gitignore` - regenerate locally as needed.
:::

## Command Structure

Generated commands follow this pattern:

```bash
grithub <namespace>:<method> [options]
```

- `namespace` - API resource (e.g., `issues`, `repos`, `users`)
- `method` - Operation name (e.g., `create`, `list`, `get`)
- `options` - Endpoint-specific parameters

## Common Examples

### Issues

```bash
# List issues
grithub issues:list-for-repo toneflix --repo grithub --state open

# Get single issue
grithub issues:get --owner toneflix --repo grithub --issue_number 42

# Create issue
grithub issues:create \
  --owner toneflix \
  --repo grithub \
  --title "Feature request" \
  --body "Add support for X"

# Add labels
grithub issues:addLabels \
  --owner toneflix \
  --repo grithub \
  --issue_number 42 \
  --labels "bug,priority"
```

### Repositories

```bash
# List user repos
grithub repos:list-for-authenticated-user --per_page 100

# Get repository
grithub repos:get --owner toneflix --repo grithub

# Create repository
grithub repos:create-for-authenticated-user \
  --name "new-repo" \
  --description "My new repository" \
  --private false

# List collaborators
grithub repos:listCollaborators --owner toneflix --repo grithub
```

### Organizations

```bash
# List organizations
grithub orgs:list-for-authenticated-user

# Get organization
grithub orgs:get --org toneflix

# List members
grithub orgs:listMembers --org toneflix --per_page 50
```

### Users

```bash
# Get authenticated user
grithub users:get-authenticated

# Get user by username
grithub users:getByUsername --username toneflix

# List followers
grithub users:listFollowersForAuthenticatedUser
```

### Pull Requests

```bash
# List pull requests
grithub pulls:list --owner toneflix --repo grithub --state open

# Get pull request
grithub pulls:get --owner toneflix --repo grithub --pull_number 10

# Create pull request
grithub pulls:create \
  --owner toneflix \
  --repo grithub \
  --title "Fix bug" \
  --head "feature-branch" \
  --base "main"

# Merge pull request
grithub pulls:merge \
  --owner toneflix \
  --repo grithub \
  --pull_number 10 \
  --merge_method squash
```

### Gists

```bash
# List gists
grithub gists:list

# Create gist
grithub gists:create \
  --description "Code snippet" \
  --public true \
  --files '{"hello.js": {"content": "console.log(\"Hello\")"}}'

# Get gist
grithub gists:get --gist_id abc123
```

## Parameter Types

Generated commands accept various parameter types:

### String Parameters

```bash
--title "My title"
--description "Some description"
```

### Number Parameters

```bash
--per_page 50
--issue_number 42
```

### Boolean Parameters

```bash
--private true
--public false
```

### Array Parameters

Pass as comma-separated values:

```bash
--labels "bug,priority,good-first-issue"
--assignees "user1,user2,user3"
```

### Object Parameters

Pass as JSON strings:

```bash
--files '{"file.txt": {"content": "Hello World"}}'
```

## Default Repository Context

When you set a default repository, `--owner` and `--repo` become optional:

```bash
# Set default
grithub set-repo toneflix/grithub

# Now these work without --owner/--repo
grithub issues:list-for-repo --state open
grithub issues:get --issue_number 42
grithub pulls:list
```

## Discovering Available Commands

List all commands including generated ones:

```bash
grithub --help
```

Get help for a specific command:

```bash
grithub issues:create --help
```

## Pagination

Many list commands support pagination:

```bash
grithub issues:list-for-repo \
  --owner toneflix \
  --repo grithub \
  --per_page 100 \
  --page 2
```

Common pagination parameters:

- `--per_page` - Results per page (usually max 100)
- `--page` - Page number (1-indexed)

## Filtering and Sorting

List endpoints often support filtering:

```bash
grithub issues:list-for-repo \
  --owner toneflix \
  --repo grithub \
  --state open \
  --labels bug \
  --sort created \
  --direction desc \
  --since "2024-01-01T00:00:00Z"
```

## Rate Limiting

Generated commands respect GitHub's rate limits. If you hit a limit:

1. Wait for the reset time
2. Use a personal access token with higher limits
3. Implement caching for read operations

Check your rate limit:

```bash
grithub rate-limit:get
```

## Error Handling

Enable debug mode for detailed errors:

```bash
grithub config --debug true
```

Common errors:

- **401 Unauthorized** - Run `grithub login` to authenticate
- **404 Not Found** - Check owner/repo names
- **422 Validation Failed** - Review required parameters
- **403 Forbidden** - Check token permissions or rate limits

## Regenerating Commands

Regenerate when:

- GitHub API updates
- You want the latest endpoints
- Generated file becomes corrupted

```bash
grithub generate:apis
```

The process is safe to run multiple times.

## Best Practices

### 1. Use Default Repository

Set once, use everywhere:

```bash
grithub set-repo your-org/your-repo
```

### 2. Save Common Commands

Create shell aliases for frequent operations:

```bash
alias gi-list='grithub issues:list-for-repo --state open'
alias gi-create='grithub issues:create'
```

### 3. Script Workflows

Use generated commands in scripts:

```bash
#!/bin/bash
# Create multiple issues
for title in "Task 1" "Task 2" "Task 3"; do
  grithub issues:create --title "$title" --labels "automated"
done
```

### 4. Combine with jq

Process JSON output:

```bash
grithub issues:list-for-repo --state open | jq '.[] | .title'
```

## API Documentation

For detailed endpoint documentation, see:

- [GitHub REST API Docs](https://docs.github.com/en/rest)
- [Octokit REST.js Reference](https://octokit.github.io/rest.js/)

## Troubleshooting

### Commands Not Available

If generated commands don't appear:

1. Verify `.grithub/apis.generated.js` exists in your current working directory.
2. Check file isn't corrupted
3. Regenerate with `grithub generate:apis`

### Parameter Errors

If parameters aren't recognized:

1. Check parameter names match GitHub API docs
2. Ensure proper formatting (JSON for objects, comma-separated for arrays)
3. Enable debug mode for detailed validation errors

### Performance Issues

For slow commands:

1. Reduce `--per_page` if listing large datasets
2. Use filtering parameters to narrow results
3. Consider caching responses locally
