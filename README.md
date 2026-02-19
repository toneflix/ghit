# Ghit
 
[![NPM Downloads](https://img.shields.io/npm/dt/ghit.svg)](https://www.npmjs.com/package/ghit)
[![npm version](https://img.shields.io/npm/v/ghit.svg)](https://www.npmjs.com/package/ghit)
[![License](https://img.shields.io/npm/l/ghit.svg)](https://github.com/toneflix/ghit/blob/main/LICENSE)
[![CI](https://github.com/toneflix/ghit/actions/workflows/ci.yml/badge.svg)](https://github.com/toneflix/ghit/actions/workflows/ci.yml)
[![Deploy Docs](https://github.com/toneflix/ghit/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/toneflix/ghit/actions/workflows/deploy-docs.yml)

Command-line toolkit for GitHub: authenticate once, set a repo, and work with issues in bulk or interactively. Includes a generator that syncs the CLI surface with the GitHub OpenAPI spec.

## Install

```bash
pnpm add -g ghit
# or npm i -g ghit
```

## Quick start

- Login: `ghit login` (opens browser flow, stores token locally)
- Set default repo: `ghit set-repo owner/name`
- Inspect info: `ghit info`
- Work with issues (interactive): `ghit issues` to list, view, close/reopen, edit, or delete
- Seed/update/delete issues in bulk: `ghit issues:seed`, `ghit issues:update`, `ghit issues:delete`

## Generated API commands (dynamic)

The CLI can generate commands directly from the GitHub OpenAPI spec. This keeps available commands and params in sync with GitHub without hand-coding.

1. Generate commands (writes `.ghit/apis.generated.js`):
   ```bash
   ghit generate:apis
   ```
2. Use generated commands (examples):
   - Create issue: `ghit issues:create --title "Bug" --owner org --repo repo`
   - List issues: `ghit issues:list-for-repo --owner org --repo repo`
   - Get single issue: `ghit issues:get --owner org --repo repo --issue_number 123`

Notes

- The generator runs once and the CLI will auto-load `.ghit/apis.generated.js` on subsequent runs.
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
- Issues: [GitHub Issues](https://github.com/toneflix/ghit/issues)
- Docs: [Octokit Documentation](https://octokit.github.io/rest.js)
- Docs: [Github REST API Documentation](https://docs.github.com/en/rest)

## Acknowledgments

- Built with [H3ravel Musket](https://github.com/h3ravel/musket)
- Powered by [Github](https://github.com)
- Tunneling by [ngrok](https://ngrok.com) (coming soon)

---

**&copy; Copyright 2026 - [ToneFlix Technologies Limited](https://toneflix.net)**
