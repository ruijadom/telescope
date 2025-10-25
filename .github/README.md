# CI/CD Configuration

This directory contains GitHub Actions workflows for Telescope.

## Workflows

### CI (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

**Jobs:**
- **Build and Test**: Builds all packages and runs tests on Node.js 18.x and 20.x
- **Lint**: Checks code formatting and linting

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

### Release (`release.yml`)

Automated release workflow using Changesets.

**Jobs:**
- **Release**: Creates release PRs or publishes packages when changesets are merged

**Triggers:**
- Push to `main` branch

**What it does:**
1. Builds all packages
2. Checks for changesets
3. If changesets exist:
   - Creates a "Version Packages" PR with updated versions
4. If "Version Packages" PR is merged:
   - Publishes packages to NPM
   - Creates GitHub releases

### Publish (`publish.yml`)

Manual publish workflow triggered by git tags.

**Jobs:**
- **Publish**: Publishes packages to NPM and creates GitHub release

**Triggers:**
- Push of tags matching `v*` (e.g., `v1.0.0`)

**Usage:**
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Dependabot

Dependabot is configured to:
- Check for npm dependency updates weekly
- Check for GitHub Actions updates weekly
- Group minor and patch updates for easier review

## Required Secrets

The following secrets must be configured in GitHub repository settings:

### `NPM_TOKEN`

NPM authentication token for publishing packages.

**How to create:**
1. Log in to npmjs.com
2. Go to Access Tokens
3. Generate New Token (Automation type)
4. Copy the token
5. Add to GitHub: Settings → Secrets → Actions → New repository secret

### `GITHUB_TOKEN`

Automatically provided by GitHub Actions. No configuration needed.

## Branch Protection

Recommended branch protection rules for `main`:

- Require pull request reviews before merging
- Require status checks to pass before merging:
  - `Build and Test (18.x)`
  - `Build and Test (20.x)`
  - `Lint`
- Require branches to be up to date before merging
- Require linear history

## Release Process

### Automated (Recommended)

1. Make changes and commit to a feature branch
2. Create a changeset: `npm run changeset`
3. Commit the changeset
4. Create a PR to `main`
5. After PR is merged, Changesets bot creates a "Version Packages" PR
6. Review and merge the "Version Packages" PR
7. Packages are automatically published to NPM

### Manual

1. Create a changeset: `npm run changeset`
2. Update versions: `npm run version`
3. Commit changes
4. Create and push a tag: `git tag v1.0.0 && git push origin v1.0.0`
5. The publish workflow will run automatically

## Troubleshooting

### Build Failures

Check the CI logs for:
- TypeScript errors
- Test failures
- Missing dependencies

### Publish Failures

Common issues:
- Invalid NPM_TOKEN
- Package version already exists
- Network issues

Check the workflow logs and verify:
- NPM token is valid and has publish access
- Version numbers are correct
- All packages build successfully

### Changeset Issues

If changesets aren't working:
- Verify `.changeset/config.json` is correct
- Check that changesets are committed
- Ensure the release workflow has proper permissions
