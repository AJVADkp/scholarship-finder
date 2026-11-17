# Contributing to ScholarSearch

Thank you for contributing to ScholarSearch. Follow these instructions to keep our code reliable, secure, and clean.

## Code of Conduct

All contributors and participants are expected to adhere to the guidelines established in our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Development Workflow

### 1. Branching Model

- The `main` branch contains verified production-ready code.
- Feature branches branch off `main` using descriptive prefixes:
  - `feat/...` for new user-facing functionality
  - `fix/...` for bug fixes and security patches
  - `refactor/...` for code restructuring without behavioral modifications
  - `test/...` for test additions or harness improvements
  - `chore/...` for tooling, dependency upgrades, or documentation

### 2. Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

Allowed types: `feat`, `fix`, `test`, `refactor`, `perf`, `chore`, `docs`, `ci`, `build`, `revert`.

### 3. Local Verification

Before creating a commit or opening a pull request, run the complete verification suite locally:

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Unit & Route Handler Tests
npm test

# Production Build
npm run build
```

### 4. Git Hooks

Pre-commit hooks are configured via Husky and lint-staged to run formatting and lint checks on staged files automatically. Commit message syntax is validated by Commitlint.
