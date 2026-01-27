# Grithub

[![npm version](https://img.shields.io/npm/v/@toneflix/grithub.svg)](https://www.npmjs.com/package/@toneflix/grithub)
[![License](https://img.shields.io/npm/l/@toneflix/grithub.svg)](https://github.com/toneflix/grithub/blob/main/LICENSE)
[![CI](https://github.com/toneflix/grithub/actions/workflows/ci.yml/badge.svg)](https://github.com/toneflix/grithub/actions/workflows/ci.yml)
[![Deploy Docs](https://github.com/toneflix/grithub/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/toneflix/grithub/actions/workflows/deploy-docs.yml)

Command-line toolkit for GitHub: authenticate once, set a repo, and work with issues in bulk or interactively. Includes a generator that syncs the CLI surface with the GitHub OpenAPI spec.

## Install

```bash
pnpm add -g @toneflix/grithub
# or npm i -g @toneflix/grithub
```

## Quick start

- Login: `grithub login` (opens browser flow, stores token locally)
- Set default repo: `grithub set-repo owner/name`
- Inspect info: `grithub info`
- Work with issues (interactive): `grithub issues` to list, view, close/reopen, edit, or delete
- Seed/update/delete issues in bulk: `grithub issues:seed`, `grithub issues:update`, `grithub issues:delete`

## Generated API commands (dynamic)

The CLI can generate commands directly from the GitHub OpenAPI spec. This keeps available commands and params in sync with GitHub without hand-coding.

1. Generate commands (writes `.grithub/apis.generated.js`):
   ```bash
   grithub generate:apis
   ```
2. Use generated commands (examples):
   - Create issue: `grithub issues:create --title "Bug" --owner org --repo repo`
   - List issues: `grithub issues:list-for-repo --owner org --repo repo`
   - Get single issue: `grithub issues:get --owner org --repo repo --issue_number 123`

Notes

- The generator runs once and the CLI will auto-load `.grithub/apis.generated.js` on subsequent runs.
- Only the command usage matters; you do not need to edit the generated file by hand.

## Contributing

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write TypeScript with proper type definitions
- Follow existing code style
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Support

- Email: support@toneflix.net
- Issues: [GitHub Issues](https://github.com/toneflix/grithub/issues)
- Docs: [Octokit Documentation](https://octokit.github.io/rest.js)
- Docs: [Github REST API Documentation](https://docs.github.com/en/rest)

## Acknowledgments

- Built with [H3ravel Musket](https://github.com/h3ravel/musket)
- Powered by [Github](https://github.com)
- Tunneling by [ngrok](https://ngrok.com) (coming soon)

---

**&copy; Copyright 2026 - [ToneFlix Technologies Limited](https://toneflix.net)**
