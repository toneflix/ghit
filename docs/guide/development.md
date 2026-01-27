# Development

Guide for contributing to Grithub development.

## Prerequisites

### Required

- **Node.js** - v20.0.0 or higher
- **pnpm** - v8.0.0 or higher (package manager)
- **Git** - For version control
- **GitHub Account** - For testing OAuth

### Optional

- **TypeScript** - Knowledge helpful but not required
- **SQLite** - Understanding of database concepts
- **GitHub API** - Familiarity with REST APIs

## Getting Started

### Clone Repository

```bash
git clone https://github.com/toneflix/grithub.git
cd grithub
```

### Install Dependencies

```bash
pnpm install
```

This installs:

- Runtime dependencies
- Development tools
- Type definitions
- Build tools

### Project Structure

```md
grithub/
├── src/ # Source code
│ ├── Commands/ # Command implementations
│ ├── Contracts/ # TypeScript interfaces
│ ├── github/ # GitHub API utilities
│ ├── utils/ # Helper functions
│ ├── cli.ts # CLI entry point
│ ├── config.ts # Configuration
│ └── db.ts # Database operations
│
├── tests/ # Test files
├── docs/ # VitePress documentation
├── bin/ # Compiled executables
├── build/ # Build output
│
├── package.json # Package configuration
├── tsconfig.json # TypeScript config
├── tsdown.config.ts # Build configuration
└── vitest.config.ts # Test configuration
```

### Run in Development

```bash
pnpm runner <command>
```

Examples:

```bash
pnpm runner login
pnpm runner issues
pnpm runner generate:apis
```

### Build

Compile TypeScript to JavaScript:

```bash
pnpm build
```

Output:

- `bin/cli.js` - ESM bundle
- `bin/cli.cjs` - CommonJS bundle

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test
pnpm vitest tests/helpers.spec.ts

# Watch mode
pnpm vitest --watch
```

### Lint Code

```bash
pnpm lint
```

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
```

### 2. Make Changes

Edit files in `src/`:

```typescript
// src/Commands/MyCommand.ts
import { Command } from '@h3ravel/musket';

export class MyCommand extends Command {
  protected signature = 'my-command';
  protected description = 'Does something amazing';

  async handle() {
    this.info('Hello from my command!');
  }
}
```

### 3. Test Changes

```bash
# Test your command
pnpm runner my-command

# Run tests
pnpm test
```

### 4. Build

```bash
pnpm build
```

### 5. Commit

```bash
git add .
git commit -m "feat: add amazing feature"
```

### 6. Push

```bash
git push origin feature/amazing-feature
```

### 7. Create Pull Request

Open PR on GitHub with:

- Clear description
- Screenshots (if UI changes)
- Test results
- Breaking changes noted

## Adding Commands

### Create Command File

```typescript
// src/Commands/ExampleCommand.ts
import { Command } from '@h3ravel/musket';
import { useCommand } from '../hooks';

export class ExampleCommand extends Command {
  protected signature = `example 
        { name : User name }
        {--g|greeting= : Greeting message }
    `;

  protected description = 'Example command';

  async handle() {
    const [_, setCommand] = useCommand();
    setCommand(this);

    const name = this.argument('name');
    const greeting = this.option('greeting', 'Hello');

    this.info(`${greeting}, ${name}!`).newLine();
  }
}
```

### Register Command

```typescript
// src/cli.ts
import { ExampleCommand } from './Commands/ExampleCommand';

Kernel.init(new Application(), {
  baseCommands: [
    // ... existing commands
    ExampleCommand,
  ],
});
```

### Test Command

```bash
pnpm runner example John --greeting="Hi"
# Output: Hi, John!
```

## Working with Database

### Database Location

```md
~/.grithub/app.db
```

### Database Operations

```typescript
import { read, write, init } from '../db';

// Initialize database
init();

// Write data
write('key', { value: 'data' });

// Read data
const data = read('key');

// Read with type
const config = read<IConfig>('config');
```

### Available Tables

- `store` - Key-value storage
  - `token` - Authentication token
  - `user` - User profile
  - `default_repo` - Default repository
  - `config` - User preferences

## Working with GitHub API

### Using Octokit

```typescript
import { useOctokit } from '../hooks';

const octokit = useOctokit();

// List issues
const issues = await octokit.rest.issues.listForRepo({
  owner: 'toneflix',
  repo: 'grithub',
  state: 'open',
});

// Create issue
await octokit.rest.issues.create({
  owner: 'toneflix',
  repo: 'grithub',
  title: 'New issue',
  body: 'Issue description',
});
```

### Error Handling

```typescript
import { promiseWrapper } from '../helpers';

const [err, result] = await promiseWrapper(
  octokit.rest.issues.create({
    owner: 'owner',
    repo: 'repo',
    title: 'Issue',
  }),
);

if (err) {
  this.error('Failed to create issue: ' + err.message);
  return;
}

this.success('Issue created: #' + result.data.number);
```

## TypeScript Guidelines

### Interfaces

Define in `src/Contracts/`:

```typescript
// src/Contracts/Interfaces.ts
export interface IIssue {
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  labels: ILabel[];
  assignees: IUser[];
}
```

### Type Safety

Use strict types:

```typescript
// Good
function getIssue(number: number): Promise<IIssue> {
  // ...
}

// Avoid
function getIssue(number: any): any {
  // ...
}
```

### Generics

```typescript
function processData<T>(data: T): T {
  // Process and return same type
  return data;
}

const issue = processData<IIssue>(issueData);
```

## Testing

### Unit Tests

```typescript
// tests/helpers.spec.ts
import { describe, it, expect } from 'vitest';
import { myHelper } from '../src/helpers';

describe('myHelper', () => {
  it('should do something', () => {
    const result = myHelper('input');
    expect(result).toBe('expected');
  });

  it('should handle errors', () => {
    expect(() => myHelper(null)).toThrow();
  });
});
```

### Run Specific Tests

```bash
# Single file
pnpm vitest tests/helpers.spec.ts

# Pattern
pnpm vitest tests/**/*.spec.ts

# With coverage
pnpm vitest --coverage
```

## Documentation

### VitePress

Documentation lives in `docs/`:

```bash
# Start dev server
pnpm docs:dev

# Build docs
pnpm docs:build

# Preview build
pnpm docs:preview
```

### Writing Docs

Create markdown files:

```markdown
# My Feature

Description of the feature.

## Usage

\`\`\`bash
grithub my-command
\`\`\`

## Options

- `--option` - Description
```

Update sidebar:

```typescript
// docs/.vitepress/config.ts
sidebar: {
    '/guide/': [
        {
            text: 'Features',
            items: [
                { text: 'My Feature', link: '/guide/my-feature' }
            ]
        }
    ]
}
```

## Debugging

### Enable Debug Mode

```bash
# In development
export GRITHUB_DEBUG=true
pnpm runner <command>
```

### Use Debugger

```typescript
// Add breakpoint
debugger;

// Or
console.log('Debug info:', variable);
```

### VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["runner", "issues"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Best Practices

### Code Style

- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Error Handling

```typescript
// Use promiseWrapper
const [err, result] = await promiseWrapper(asyncOperation());

if (err) {
  this.error('Operation failed: ' + err.message);
  return;
}
```

### User Feedback

```typescript
// Use spinners for long operations
const spinner = this.spinner('Processing...').start();

try {
  await longOperation();
  spinner.succeed('Success!');
} catch (error) {
  spinner.fail('Failed!');
}
```

### Configuration

```typescript
// Read config safely
const [getConfig] = useConfig();
const config = getConfig();

if (!config) {
  // Handle missing config
}
```

## Common Tasks

### Update Dependencies

```bash
# Update all
pnpm update

# Update specific
pnpm update @octokit/rest

# Check outdated
pnpm outdated
```

### Add Dependency

```bash
# Production
pnpm add package-name

# Development
pnpm add -D package-name
```

### Release Process

```bash
# Version bump
pnpm version patch  # or minor, major

# Build
pnpm build

# Publish
pnpm publish
```

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf build/ bin/
pnpm install
pnpm build
```

### Tests Fail

```bash
# Clear test cache
pnpm vitest --clearCache

# Run single test
pnpm vitest tests/specific.spec.ts
```

### Type Errors

```bash
# Check types without building
pnpm tsc --noEmit
```

## Resources

- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Octokit REST.js](https://octokit.github.io/rest.js/)
- [H3ravel Musket](https://github.com/h3ravel/musket)
- [GitHub API Docs](https://docs.github.com/en/rest)

## Next Steps

- [Contributing](/guide/contributing) - Contribution guidelines
- [Commands](/guide/commands) - Command structure
- [API Reference](/api/issues) - API documentation
