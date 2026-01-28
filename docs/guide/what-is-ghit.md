# What is Ghit?

Ghit is a powerful command-line toolkit for GitHub that combines hand-crafted workflows with auto-generated commands from the GitHub OpenAPI specification.

## The Problem

Managing GitHub repositories through the web interface can be:

- **Time-consuming** - Clicking through multiple pages for repetitive tasks
- **Error-prone** - Manual processes lead to inconsistencies
- **Limited** - Web UI doesn't support bulk operations well
- **Disconnected** - No integration with local development workflow

## The Solution

Ghit provides:

### Hand-Crafted Workflows

Purpose-built commands for common tasks:

- **Interactive Issues Dashboard** - Browse, edit, close, and delete issues
- **Bulk Operations** - Seed, update, or delete multiple issues at once
- **Smart Diffing** - Update only changed content when syncing issues
- **Markdown-Based** - Manage issues as version-controlled markdown files

### Auto-Generated Commands

Access the entire GitHub API:

- **Complete Coverage** - Every GitHub REST endpoint as a CLI command
- **Always Up-to-Date** - Regenerate when GitHub's API changes
- **Type-Safe** - Parameter validation from OpenAPI spec
- **Consistent** - Same patterns across all endpoints

### Simple Authentication

- One-time OAuth browser flow
- Secure local token storage
- Works across all commands
- CI/CD friendly with environment variables

## Core Features

### Repository Context

Set a default repository once:

```bash
ghit set-repo owner/repository
```

Then work without repeating flags:

```bash
ghit issues:create --title "Bug fix"
ghit issues:listForRepo --state open
```

### Issue Management

#### Interactive Mode

Launch a dashboard to browse and manage issues:

```bash
ghit issues
```

Features:

- Paginated issue browsing
- View full issue details
- Close/reopen issues
- Edit titles and descriptions
- Delete issues

#### Bulk Creation

Create dozens of issues from markdown files:

```md
issues/
├── 001-feature-a.md
├── 002-feature-b.md
└── 003-bug-fix.md
```

```bash
ghit issues:seed ./issues
```

#### Smart Updates

Modify markdown files and sync changes:

```bash
ghit issues:update ./issues
```

Ghit detects:

- Title changes
- Label updates
- Body modifications
- Unchanged content (skips API calls)

### Generated API Access

Generate commands once:

```bash
ghit generate:apis
```

Then use any GitHub endpoint:

```bash
# Repositories
ghit repos:listForAuthenticatedUser --per_page 100

# Pull Requests
ghit pulls:list --state open
ghit pulls:merge --pull_number 10 --merge_method squash

# Organizations
ghit orgs:listForAuthenticatedUser
ghit orgs:listMembers --org company

# Users
ghit users:getAuthenticated
ghit users:listFollowersForAuthenticatedUser
```

## Use Cases

### Project Kickoff

Quickly set up new repositories with standard issues:

```bash
# Create issue templates
mkdir project-templates/standard

# Add markdown files for common issues
# - Setup CI/CD
# - Configure linting
# - Add tests
# - Write documentation

# Seed to new projects
ghit set-repo company/new-project
ghit issues:seed project-templates/standard
```

### Sprint Planning

Manage sprint backlogs:

```bash
# Create sprint directory
mkdir sprint-2024-Q1

# Add user stories as markdown
# Track in version control
git add sprint-2024-Q1/
git commit -m "Sprint planning"

# Seed to GitHub
ghit issues:seed sprint-2024-Q1
```

### Migration from Other Tools

Move issues from Jira, Linear, etc.:

1. Export from old tool
2. Convert to markdown format
3. Seed to GitHub:
   ```bash
   ghit issues:seed ./migrated-issues
   ```

### Repository Cleanup

Remove test or duplicate issues:

```bash
ghit issues:delete --start 1 --end 50
```

### CI/CD Integration

Automate issue creation from workflows:

```yaml
# .github/workflows/create-issue.yml
- name: Create Issue
  run: |
    ghit issues:create \
      --title "Deploy failed" \
      --body "Build #${{ github.run_number }} failed"
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Team Collaboration

Track issues in git alongside code:

```bash
# Everyone can see issue templates
git clone repo
cat .github/issues/*.md

# Update and sync
vi .github/issues/001-feature.md
git commit -am "Update feature requirements"
git push
ghit issues:update .github/issues
```

## How It Works

### Architecture

```md
Ghit CLI
├── Built-in Commands (TypeScript)
│ ├── login / logout
│ ├── config
│ ├── issues (interactive)
│ ├── issues:seed
│ ├── issues:update
│ └── issues:delete
│
├── Generated Commands (Runtime)
│ ├── Parsed from GitHub OpenAPI spec
│ ├── Generated once, loaded on startup
│ └── Covers entire GitHub REST API
│
├── Authentication Layer
│ ├── OAuth flow
│ ├── Token storage (SQLite)
│ └── Automatic token injection
│
└── Configuration
├── Default repository
├── API settings
└── User preferences
```

### Data Flow

1. **Authentication**

   ```md
   User → Browser OAuth → GitHub → Token → SQLite DB
   ```

2. **Command Execution**

   ```md
   Command → Load Config → Inject Token → GitHub API → Response → Display
   ```

3. **Bulk Operations**
   ```md
   Markdown Files → Parse Frontmatter → Diff Against GitHub → Update Changed → Report
   ```

## Technology Stack

### Core

- **TypeScript** - Type-safe development
- **Node.js** - Runtime environment
- **@octokit/rest** - GitHub API client
- **@h3ravel/musket** - CLI framework

### Features

- **SQLite** (better-sqlite3) - Local data storage
- **OAuth** (@octokit/oauth-methods) - Authentication
- **OpenAPI** (@octokit/openapi) - API spec parsing
- **Diff** (fast-diff) - Smart content comparison

### Build & Distribution

- **tsdown** - TypeScript bundler
- **npm** - Package distribution
- **pnpm** - Development package manager

## Design Philosophy

### CLI-First

Optimized for terminal workflows:

- Fast execution
- Scriptable commands
- Pipe-friendly output
- Non-interactive modes

### Developer Experience

Built for productivity:

- Intuitive command names
- Helpful error messages
- Smart defaults
- Progressive disclosure

### Flexibility

Adapts to your workflow:

- Interactive or scripted
- Single operations or bulk
- Direct commands or generated
- Local or CI/CD

### Transparency

No magic:

- Clear command structure
- Visible configuration
- Explicit operations
- Predictable behavior

## Comparison

### vs GitHub CLI (gh)

**Ghit:**

- Auto-generated commands from OpenAPI
- Bulk issue operations
- Markdown-based issue management
- Smart diffing for updates

**GitHub CLI:**

- Official tool
- More repository management features
- Better GitHub Actions integration
- Codespaces support

**Use both:** They complement each other!

### vs Web Interface

**Ghit:**

- Bulk operations
- Version-controlled issue templates
- Scriptable workflows
- Faster for repetitive tasks

**Web Interface:**

- Visual feedback
- Rich editing
- Better for one-off tasks
- No installation needed

### vs GitHub API Directly

**Ghit:**

- No code required
- Authentication handled
- Command validation
- Friendly output

**Direct API:**

- More control
- Language of choice
- Custom processing
- No dependencies

## Getting Started

Ready to try Ghit?

1. **Install**

   ```bash
   pnpm add -g ghit
   ```

2. **Authenticate**

   ```bash
   ghit login
   ```

3. **Set Repository**

   ```bash
   ghit set-repo owner/repo
   ```

4. **Start Working**
   ```bash
   ghit issues
   ```

## Next Steps

- [Getting Started](/guide/getting-started) - Detailed installation and setup
- [Quick Start](/guide/quick-start) - Common workflows
- [Commands](/guide/commands) - Complete command reference
- [API Reference](/api/issues) - Detailed API documentation
