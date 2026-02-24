# Bulk Issues Creation Tutorial

This guide explains how to use AI-powered workflows to generate and seed GitHub issues in bulk using [Ghit](https://ghit.toneflix.net). You can create issues from multiple markdown files or a single markdown file containing several issues.

## 1. Multiple Markdown Files (AI File Generation)

**Scenario:**

- You want AI to generate individual markdown files for each issue.
- Each file is saved in a directory (e.g., `issues/` or `tests/issues/demo/` or where ever TF you want).

**Steps:**

1. Use the AI prompt to describe the issues you want generated.
2. AI can, and will create separate `.md` files for each issue, including frontmatter (title, labels, etc.).
3. Run the following command to seed issues:

```bash
ghit issues:seed issues/
```

**Example Directory Structure:**

```md
issues/
├── 001-feature-request.md
├── 002-bug-report.md
├── 003-enhancement.md
```

**Example Issue File:**

```md
---
title: Feature Request: Add Dark Mode
labels: enhancement, ui
type: Feature
---

## Description

Please add a dark mode option to the application.
```

## 2. Single Markdown File (Manual Copy/Paste)

**Scenario:**

- You want to generate multiple issues in a single markdown file.
- AI cannot create files directly; you copy the generated content and save it manually.
- Issues are separated by `++++++` or `======` lines.

**Steps:**

1. Use the AI prompt to generate a single markdown file containing all issues.
2. Copy the content and save it as `bulk-issues.md` (or any F\*\*\* name).
3. Run the following command to seed issues:

```bash
ghit issues:seed bulk-issues.md
```

OR

```bash
ghit issues:seed some/godamn/path/bulk-issues.md
```

**Example File Format:**

```txt
---
title: Bug: Login Fails
labels: bug, auth
type: Bug
---

## Description

Login fails for users with special characters in their password.

++++++

---
title: Feature: Export Data
labels: feature, data
type: Feature
---

## Description

Allow users to export their data in CSV format.
```

## Notes

- The separator can be either `++++++` or `======` (must be on its own line).
- Frontmatter is required for each issue.
- You can use the `--dry-run` option to preview which issues will be created.

## AI Prompt Examples

**Multiple Files Issue Prompt**

```txt
Generate 5 markdown files for GitHub issues about authentication
bugs, each issue should be formatted as follows:

---
type: [Feature | Task | Bug ]
title: Issue Title
labels: ['label1', 'label2', 'label3']
assignees: ''
---

## Section 1

Section Description

## Section Nth

Section Description

Filename should be in the
format `001-issue-title.md`, `002-another-issue.md`, etc.
```

**Single File Issues Prompt**

```txt
Generate a single markdown file containing 3 issues about UI
improvements, separated by `++++++`, each issue should be
formatted as follows:

---
type: [Feature | Task | Bug ]
title: Issue Title
labels: ['label1', 'label2', 'label3']
assignees: ''
---

## Section 1

Section Description

## Section Nth

Section Description
```

---

For more details, see the [Bulk Operations](../guide/bulk-operations.md) and [Commands](../guide/commands.md) pages.
