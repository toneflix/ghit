# Contributing

Thank you for considering contributing to Grithub! This guide will help you get started.

## Code of Conduct

Be respectful and constructive in all interactions. We aim to create a welcoming environment for contributors of all backgrounds.

## How to Contribute

There are many ways to contribute:

### Report Bugs

Found a bug? [Open an issue](https://github.com/toneflix/grithub/issues/new) with:

- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)
- Screenshots if applicable

**Example:**

```markdown
**Bug:** Issues command fails with authentication error

**Steps to reproduce:**

1. Run `grithub login`
2. Run `grithub issues`
3. See error: "Authentication failed"

**Expected:** Should show list of issues

**Environment:**

- OS: macOS 14.2
- Node: 18.19.0
- Grithub: 0.1.6
```

### Suggest Features

Have an idea? [Open a feature request](https://github.com/toneflix/grithub/issues/new) with:

- Clear use case
- Proposed solution
- Alternative approaches considered
- Willingness to implement

**Example:**

```markdown
**Feature:** Add support for GitHub Discussions

**Use case:** Teams using Discussions want CLI management

**Proposed solution:**

- Add `grithub discussions` command
- Support CRUD operations
- Enable bulk operations

**Alternatives:**

- Use GitHub CLI (lacks bulk operations)
- Manual API calls (not user-friendly)

**Implementation:** I can implement this if approved
```

### Improve Documentation

Documentation is crucial! You can:

- Fix typos or unclear explanations
- Add examples or use cases
- Improve code samples
- Translate to other languages

Documentation lives in `docs/`:

```bash
# Start docs server
pnpm docs:dev

# Edit markdown files
vi docs/guide/getting-started.md

# Preview changes at http://localhost:5173
```

### Write Code

Ready to code? Follow this workflow:

## Development Workflow

### 1. Fork Repository

Click "Fork" on [GitHub](https://github.com/toneflix/grithub)

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/grithub.git
cd grithub
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/toneflix/grithub.git
```

### 4. Create Branch

```bash
git checkout -b feature/my-feature
```

Branch naming:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes

### 5. Install Dependencies

```bash
pnpm install
```

### 6. Make Changes

Edit files in `src/`:

```typescript
// Example: src/Commands/MyCommand.ts
import { Command } from '@h3ravel/musket';

export class MyCommand extends Command {
  protected signature = 'my-command';
  protected description = 'My new command';

  async handle() {
    this.info('Hello, Grithub!');
  }
}
```

### 7. Test Changes

```bash
# Run in development
pnpm runner my-command

# Run tests
pnpm test

# Lint code
pnpm lint
```

### 8. Commit Changes

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git add .
git commit -m "feat: add my-command"
```

Commit types:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance

**Examples:**

```bash
git commit -m "feat: add bulk delete for pull requests"
git commit -m "fix: resolve authentication timeout issue"
git commit -m "docs: update installation instructions"
git commit -m "refactor: simplify issue parsing logic"
```

### 9. Push Changes

```bash
git push origin feature/my-feature
```

### 10. Create Pull Request

Go to GitHub and click "Compare & pull request"

**PR Template:**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How was this tested?

## Checklist

- [ ] Code follows project style
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Development Guidelines

### Code Style

#### TypeScript

Use strict typing:

```typescript
// Good
function getIssue(number: number): Promise<IIssue> {
  return octokit.rest.issues.get({ number });
}

// Avoid
function getIssue(number: any): any {
  return octokit.rest.issues.get({ number });
}
```

#### Naming Conventions

```typescript
// Classes: PascalCase
class IssuesCommand extends Command {}

// Functions/Variables: camelCase
function parseIssue(data: any) {}
const issueNumber = 42;

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Interfaces: PascalCase with I prefix
interface IUser {
  name: string;
  email: string;
}
```

#### File Structure

```typescript
// Imports first
import { Command } from '@h3ravel/musket';
import { useOctokit } from '../hooks';
import type { IIssue } from '../Contracts/Interfaces';

// Class/function definition
export class MyCommand extends Command {
  // Class implementation
}

// No default export for classes
// Use named exports
```

### Error Handling

Always handle errors gracefully:

```typescript
import { promiseWrapper } from '../helpers';

const [err, result] = await promiseWrapper(
  octokit.rest.issues.create({
    /* ... */
  }),
);

if (err) {
  this.error(`Failed to create issue: ${err.message}`);
  return;
}

this.success(`Issue #${result.data.number} created`);
```

### User Feedback

Provide clear feedback:

```typescript
// Use spinners for operations
const spinner = this.spinner('Creating issue...').start();

try {
  await createIssue();
  spinner.succeed('Issue created successfully');
} catch (error) {
  spinner.fail('Failed to create issue');
  this.error(error.message);
}

// Use appropriate log levels
this.info('Information message');
this.success('Success message');
this.warn('Warning message');
this.error('Error message');
```

### Testing

Write tests for new features:

```typescript
// tests/my-feature.spec.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../src/my-feature';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });

  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBeUndefined();
  });
});
```

### Documentation

Document all public APIs:

```typescript
/**
 * Creates an issue in the specified repository.
 *
 * @param owner - Repository owner
 * @param repo - Repository name
 * @param title - Issue title
 * @param body - Issue description
 * @returns Created issue object
 * @throws {Error} If authentication fails
 */
async function createIssue(
  owner: string,
  repo: string,
  title: string,
  body?: string,
): Promise<IIssue> {
  // Implementation
}
```

## Pull Request Guidelines

### Before Submitting

Checklist:

- [ ] Code follows style guidelines
- [ ] All tests pass: `pnpm test`
- [ ] Lint passes: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] Branch is up to date with main

### PR Description

Include:

1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work?
4. **Testing** - How was it tested?
5. **Screenshots** - If UI changes

### Review Process

1. **Automated Checks** - CI runs tests and linting
2. **Code Review** - Maintainer reviews code
3. **Feedback** - Address review comments
4. **Approval** - PR approved for merge
5. **Merge** - Squash and merge to main

### After Merge

Your contribution will be:

- Included in next release
- Listed in changelog
- Credited in release notes

## First Time Contributors

New to open source? Look for issues labeled:

- `good first issue` - Easy entry points
- `help wanted` - Contributions welcome
- `documentation` - Docs improvements

Don't hesitate to ask questions!

## Getting Help

### Questions

- Open a [Discussion](https://github.com/toneflix/grithub/discussions)
- Ask in [Issues](https://github.com/toneflix/grithub/issues)

### Stuck?

- Review [Development Guide](/guide/development)
- Check existing [Pull Requests](https://github.com/toneflix/grithub/pulls)
- Read [GitHub Docs](https://docs.github.com/en/rest)

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

## Recognition

Contributors are recognized:

- In release notes
- In changelog
- On GitHub contributors page

Thank you for contributing to Grithub! 🎉

## Next Steps

- [Development Guide](/guide/development) - Set up development environment
- [Commands](/guide/commands) - Learn command structure
- [GitHub Issues](https://github.com/toneflix/grithub/issues) - Find issues to work on
