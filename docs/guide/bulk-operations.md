# Bulk Operations

Grithub excels at managing multiple issues at once, saving time when setting up new repositories or performing batch updates.

## Overview

Bulk operations allow you to:

- Create dozens of issues from markdown files
- Update multiple issues with smart diffing
- Delete issue ranges efficiently
- Track changes in version control

## Seeding Issues

Create multiple issues from a directory of markdown files.

### Directory Structure

Organize your issues in a directory:

```md
issues/
├── 001-setup-ci-pipeline.md
├── 002-add-unit-tests.md
├── 003-update-documentation.md
├── 004-improve-error-handling.md
└── 005-add-logging.md
```

### Markdown File Format

Each file represents one issue with frontmatter metadata:

```markdown
---
type: Feature
title: Setup CI Pipeline
labels: ['enhancement', 'ci', 'devops']
assignees: ['devops-team', 'ci-admin']
---

## Description

Implement GitHub Actions workflow for automated testing and deployment.

## Tasks

- [ ] Create workflow file
- [ ] Configure test jobs
- [ ] Add deployment steps
- [ ] Set up environment secrets

## Acceptance Criteria

- All tests pass on every push
- Automatic deployment to staging
- Production deployment on release tags
```

### Running the Seeder

```bash
grithub issues:seed ./issues
```

This will:

1. Parse all `.md` files in the directory
2. Extract frontmatter (title, labels, assignees)
3. Use remaining content as issue body
4. Create issues in sequential order
5. Display progress with success/error messages

### With Specific Repository

```bash
grithub issues:seed ./issues --repo owner/repository
```

### Example Output

```md
✓ Creating issue 1/5: Setup CI Pipeline
✓ Creating issue 2/5: Add Unit Tests
✓ Creating issue 3/5: Update Documentation
✓ Creating issue 4/5: Improve Error Handling
✓ Creating issue 5/5: Add Logging

Successfully created 5 issues
```

## Updating Issues

Modify existing issues based on updated markdown files.

### How It Works

The updater uses intelligent diffing to detect changes:

1. Reads your markdown files
2. Fetches corresponding issues from GitHub
3. Compares content using diff algorithm
4. Updates only modified fields
5. Preserves unchanged data

### Smart Diffing

Only updates when content actually changes:

- **Title changed** → Updates title
- **Labels added/removed** → Updates labels array
- **Body modified** → Updates body content
- **No changes** → Skips update (saves API calls)

### Running the Updater

```bash
grithub issues:update ./issues
```

### Workflow Example

1. Create initial issues:

   ```bash
   grithub issues:seed ./issues
   ```

2. Make changes to markdown files:

   ```markdown
   ---
   type: Task
   title: Setup CI Pipeline (Updated)
   labels: ['enhancement', 'ci', 'devops', 'priority']
   assignees: ['devops-team', 'ci-admin', 'new-member']
   ---

   ## Description (Enhanced)

   Implement comprehensive GitHub Actions workflow...
   ```

3. Update the issues:

   ```bash
   grithub issues:update ./issues
   ```

4. Only modified issues are updated:
   ```md
   ✓ Issue #1 updated (title, labels, body changed)
   ⊘ Issue #2 skipped (no changes)
   ✓ Issue #3 updated (body changed)
   ⊘ Issue #4 skipped (no changes)
   ⊘ Issue #5 skipped (no changes)
   ```

## Deleting Issues

Remove multiple issues in a range.

### Basic Usage

```bash
grithub issues:delete
```

### With Confirmation

The command will:

1. Show a list of all deletable issues
2. You can select multiple issues to delte
3. Ask for confirmation
4. Delete issues one by one
5. Display progress

### Example Output

```md
✔ 2 issues fetched successfully.
? Select Issue
❯◯ #27: 🟢 Define database schema and create Prisma models for all entities
◯ #26: 🟢 Initialize API with Next.js API routes, food and database.

↑↓ navigate • space select • a all • i invert • ⏎ submit
```

### Specific Repository

```bash
grithub issues:delete owner/repository
```

::: danger
Issue deletion is permanent. Deleted issues cannot be recovered.
Always double-check before confirming.
:::

## Version Control Integration

Track your issues in Git for better collaboration and history.

### Repository Structure

```md
project/
├── .git/
├── .gitignore
├── src/
├── docs/
└── .github/
└── issues/
├── 001-feature-a.md
├── 002-feature-b.md
└── 003-bug-fix.md
```

### Workflow

1. **Initial Setup**

   ```bash
   mkdir -p .github/issues
   cd .github/issues
   # Create your markdown files
   ```

2. **Commit to Git**

   ```bash
   git add .github/issues/
   git commit -m "Add initial issue templates"
   git push origin main
   ```

3. **Seed to GitHub**

   ```bash
   grithub issues:seed .github/issues
   ```

4. **Team Member Makes Changes**

   ```bash
   # Edit .github/issues/001-feature-a.md
   git commit -am "Update feature A requirements"
   git push
   ```

5. **Sync to GitHub**
   ```bash
   git pull
   grithub issues:update .github/issues
   ```

## Best Practices

### File Naming

Use numeric prefixes for ordering:

```md
001-first-issue.md
002-second-issue.md
...
099-ninety-ninth-issue.md
```

This ensures:

- Predictable creation order
- Easy file management
- Clear visual ordering

### Frontmatter Standards

Be consistent with metadata:

```yaml
---
type: Bug
title: Clear, Descriptive Title
labels: ['type:feature', 'priority:high', 'area:frontend']
assignees: ['username1', 'username2']
---
```

Label conventions:

- `type:` - feature, bug, enhancement, docs
- `priority:` - low, medium, high, critical
- `area:` - frontend, backend, devops, design

### Content Structure

Use markdown effectively:

```markdown
---
title: Feature Title
labels: ['feature']
---

## Overview

Brief description of the feature.

## Requirements

- Requirement 1
- Requirement 2

## Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Acceptance Criteria

- Criteria 1 is met
- Criteria 2 is met

## Additional Context

Any extra information, links, or references.
```

### Incremental Updates

Don't recreate everything at once:

1. Start with high-priority issues
2. Seed them first
3. Iterate based on feedback
4. Add more issues as needed

### Review Before Seeding

Check files before bulk creation:

```bash
# Preview what will be created
ls .github/issues/
cat .github/issues/*.md
```

### Backup Important Ranges

Before bulk deletion, if you have generated commands:

```bash
# Export issues first (using generated commands)
grithub issues:list-for-repo > backup.json
```

## Real-World Examples

### Project Kickoff

Set up a new repository with standard issues:

```bash
# Create template directory
mkdir -p project-templates/standard-setup

# Add issue templates
cat > project-templates/standard-setup/001-setup-ci.md << 'EOF'
---
title: Setup CI/CD Pipeline
labels: ["devops", "setup"]
assignees: ["devops-lead"]
---
Configure GitHub Actions for CI/CD
EOF

# Create more templates...

# Seed to multiple projects
grithub set-repo org/project-a
grithub issues:seed project-templates/standard-setup

grithub set-repo org/project-b
grithub issues:seed project-templates/standard-setup
```

### Migration from Other Tools

Convert issues from Jira, Linear, etc.:

```bash
# 1. Export from other tool (format as markdown)
# 2. Place in directory
# 3. Seed to GitHub

grithub issues:seed ./migrated-issues
```

### Sprint Planning

Create sprint issues in bulk:

```bash
# Sprint directory structure
sprint-2024-Q1/
├── 001-user-story-1.md
├── 002-user-story-2.md
└── 003-bug-fixes.md

grithub issues:seed sprint-2024-Q1
```

### Quarterly Goals

Track OKRs as issues:

```bash
okrs-2024-Q1/
├── objective-1-increase-users.md
├── objective-2-improve-performance.md
└── objective-3-expand-features.md

grithub issues:seed okrs-2024-Q1
```

## Automation

### CI/CD Integration

Auto-sync issues on changes:

```yaml
# .github/workflows/sync-issues.yml
name: Sync Issues

on:
  push:
    paths:
      - '.github/issues/**'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install Grithub
        run: npm install -g @toneflix/grithub

      - name: Update Issues
        run: grithub issues:update .github/issues
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Scripted Workflows

Combine with shell scripts:

```bash
#!/bin/bash
# bulk-create-features.sh

FEATURES=("Login" "Dashboard" "Settings" "Profile" "Notifications")

for i in "${!FEATURES[@]}"; do
  NUM=$(printf "%03d" $((i+1)))
  FEATURE="${FEATURES[$i]}"

  cat > "issues/${NUM}-${FEATURE,,}.md" << EOF
---
title: Implement ${FEATURE}
labels: ["feature", "frontend"]
assignees: ["dev-team"]
---

Implement ${FEATURE} feature for the application.
EOF
done

grithub issues:seed ./issues
```

## Troubleshooting

### Rate Limiting

If you hit rate limits during bulk operations:

```bash
# Reduce concurrency (future feature)
# For now, seed in smaller batches

grithub issues:seed ./issues/batch-1
sleep 60
grithub issues:seed ./issues/batch-2
```

### Validation Errors

If issues fail to create:

1. Check frontmatter syntax (valid YAML)
2. Verify labels exist in repository
3. Confirm assignees have access
4. Enable debug mode:
   ```bash
   grithub config --debug true
   grithub issues:seed ./issues
   ```

### Diff Detection Issues

If updates aren't detected:

1. Check file encoding (use UTF-8)
2. Verify line endings (LF, not CRLF)
3. Remove invisible characters
4. Check that issue numbers match filenames

### Permission Errors

Ensure your token has proper scopes:

```bash
# Re-login to refresh permissions
grithub logout
grithub login
```

Required scopes:

- `repo` - Full repository access
- `write:org` - Organization access (if applicable)

## Performance Tips

### Large Batches

For 100+ issues:

1. Split into multiple directories
2. Seed in batches
3. Monitor progress
4. Use version control to track seeded files

### Network Optimization

- Run on stable internet connection
- Avoid VPNs that might throttle
- Consider time of day (GitHub's load)

### File Organization

Keep directories focused:

```md
issues/
├── features/
│ └── _.md
├── bugs/
│ └── _.md
└── enhancements/
└── \*.md
```

Seed by category:

```bash
grithub issues:seed issues/features
grithub issues:seed issues/bugs
```

## Next Steps

- [Issues API Reference](/api/issues) - Full command documentation
- [Configuration](/guide/configuration) - Customize behavior
