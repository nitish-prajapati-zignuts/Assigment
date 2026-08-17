# Contributing to AI Meeting Notes & Action Item Summarizer

Thank you for your interest in contributing! We welcome all contributions, including bug reports, feature requests, documentation improvements, and code changes.

Please take a moment to review this document before submitting your contribution.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [nitishprajapati180@gmail.com](mailto:nitishprajapati180@gmail.com).

---

## How Can I Contribute?

### 1. Reporting Bugs
- Search existing issues to see if the bug has already been reported.
- If not, create a new issue using our Bug Report template.
- Provide a clear description, reproduction steps, and details about your environment (OS, Node version, etc.).

### 2. Suggesting Enhancements
- Search existing issues to ensure the feature request doesn't already exist.
- Explain the problem, describe your proposed solution, and highlight the benefits.

### 3. Submitting Pull Requests (PRs)
- Fork the repository and create a new branch from `main`.
- Follow the branch naming convention: `feature/your-feature-name` or `bugfix/your-bug-name`.
- Make your changes, ensuring code matches the established formatting and style guidelines.
- Commit your changes using **Conventional Commits** (details below).
- Open a PR against the `main` branch and fill out the [Pull Request Template](.github/pull_request_template.md).

---

## Development Setup

See the [README.md](README.md) for full instructions on setting up your local development environment.

### Code Style & Quality
Before submitting a PR, make sure your code passes linting and formatting:
- **Format Code**: Run `npm run format`
- **Lint Code**: Run `npm run lint`

---

## Commit Message Guidelines

This repository uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate versioning and package releases. Because of this, we strictly enforce **Conventional Commits**.

Commit messages must follow this format:
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Common Types:
- `feat`: A new feature (triggers a MINOR release)
- `fix`: A bug fix (triggers a PATCH release)
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools/libraries

### Example Commit:
```
feat(auth): add MFA support for enterprise users

Closes #42
```
