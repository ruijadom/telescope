# Publishing Guide

This document describes how to publish Telescope packages to NPM.

## Prerequisites

1. You must have NPM publish access to the `@@ruijadom/telescope` scope
2. You must be logged in to NPM: `npm login`
3. All packages must build successfully: `npm run build`
4. All tests must pass: `npm test`

## Publishing Process

Telescope uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

### 1. Create a Changeset

When you make changes that should be published, create a changeset:

```bash
npm run changeset
```

This will prompt you to:
- Select which packages have changed
- Select the type of change (major, minor, patch)
- Write a summary of the changes

The changeset will be saved in the `.changeset` directory.

### 2. Version Packages

When you're ready to publish, update package versions:

```bash
npm run version
```

This will:
- Update package.json versions based on changesets
- Update CHANGELOG.md files
- Delete consumed changesets

### 3. Publish to NPM

Build and publish all packages:

```bash
npm run release
```

This will:
- Build all packages
- Publish changed packages to NPM
- Create git tags for the new versions

## Publishing Individual Packages

If you need to publish a single package:

```bash
cd packages/[package-name]
npm publish --access public
```

## Version Strategy

Telescope uses semantic versioning:

- **Major (1.0.0)**: Breaking changes
- **Minor (0.1.0)**: New features, backwards compatible
- **Patch (0.0.1)**: Bug fixes, backwards compatible

All packages are linked and will be versioned together to maintain compatibility.

## Pre-release Versions

To publish a pre-release version:

```bash
npm run changeset -- --snapshot alpha
npm run version
npm run release -- --tag alpha
```

## Troubleshooting

### Build Failures

If builds fail, check:
- TypeScript compilation errors: `npm run typecheck`
- Missing dependencies: `npm install`
- Clean build: `npm run clean && npm run build`

### Publish Failures

If publishing fails:
- Verify NPM authentication: `npm whoami`
- Check package access: Packages must be public or you must have access
- Verify version doesn't already exist on NPM

### Dependency Issues

If internal dependencies fail:
- Ensure all packages are built: `npm run build`
- Check workspace links: `npm install`
- Verify version ranges in package.json files

## Post-Publishing

After publishing:

1. Commit and push version changes:
   ```bash
   git add .
   git commit -m "chore: release packages"
   git push
   git push --tags
   ```

2. Create a GitHub release with the changelog

3. Update documentation if needed

4. Announce the release
