# Build and Release Pipeline

This document describes the build and release pipeline for Telescope.

## Overview

Telescope uses a modern monorepo setup with:
- **NPM Workspaces** for package management
- **TypeScript** for type safety
- **tsup** for fast bundling
- **Changesets** for version management
- **GitHub Actions** for CI/CD

## Package Structure

```
@ruijadom/telescope/
├── packages/
│   ├── core/                    # Core types and server
│   ├── browser-runtime/         # Browser component detection
│   ├── cursor-integration/      # Cursor editor integration
│   ├── vite-plugin/            # Vite plugin
│   ├── webpack-plugin/         # Webpack plugin
│   ├── cli/                    # Command line interface
│   └── @ruijadom/telescope/           # Meta package (all-in-one)
```

## Build Scripts

### Root Level

```bash
npm run build       # Build all packages
npm run clean       # Clean all dist folders
npm run dev         # Watch mode for all packages
npm run test        # Run all tests
npm run typecheck   # Type check all packages
```

### Package Level

Each package has:
```bash
npm run build           # Build the package
npm run dev             # Watch mode
npm run clean           # Clean dist folder
npm run typecheck       # Type check
npm run prepublishOnly  # Pre-publish hook (builds automatically)
```

## Build Configuration

### TypeScript

- **Base config**: `tsconfig.base.json` - Shared TypeScript configuration
- **Package configs**: Each package extends the base config
- **Target**: ES2020
- **Module**: ESNext with CommonJS/ESM dual output

### tsup

Each package uses tsup for bundling:

- **core**: CJS + ESM output
- **browser-runtime**: IIFE bundle for browser (includes all dependencies)
- **cursor-integration**: CJS + ESM output
- **vite-plugin**: CJS + ESM output with multiple entry points
- **webpack-plugin**: CJS + ESM output with loader
- **cli**: CJS + ESM output with shebang for CLI

### Output Formats

- **CommonJS** (`.js`): For Node.js require()
- **ESM** (`.mjs`): For modern import/export
- **IIFE** (`.global.js`): For browser script tags
- **Type Definitions** (`.d.ts`, `.d.mts`): TypeScript types

## Version Management

### Changesets

Telescope uses Changesets for coordinated version management:

```bash
npm run changeset   # Create a new changeset
npm run version     # Update versions based on changesets
npm run release     # Build and publish packages
```

### Linked Packages

All packages are linked together and version in sync to maintain compatibility.

### Versioning Strategy

- **Major**: Breaking changes
- **Minor**: New features (backwards compatible)
- **Patch**: Bug fixes (backwards compatible)

## Publishing

### Automated Publishing (Recommended)

1. Create changesets for your changes
2. Merge PR to main
3. Changesets bot creates "Version Packages" PR
4. Merge "Version Packages" PR
5. Packages automatically publish to NPM

### Manual Publishing

```bash
# 1. Create changeset
npm run changeset

# 2. Update versions
npm run version

# 3. Build and publish
npm run release
```

### Package Metadata

All packages include:
- Repository URL
- Author information
- License (MIT)
- Keywords for NPM search
- Files whitelist (only dist/ is published)

## CI/CD Workflows

### CI (`ci.yml`)

Runs on every push and PR:
- Type checking
- Building all packages
- Running tests
- Matrix testing on Node.js 18.x and 20.x

### Release (`release.yml`)

Automated release on main branch:
- Creates version PRs via Changesets
- Publishes to NPM when version PR is merged
- Requires `NPM_TOKEN` secret

### Publish (`publish.yml`)

Manual publish via git tags:
- Triggered by pushing tags (e.g., `v1.0.0`)
- Builds, tests, and publishes
- Creates GitHub releases

### Dependabot

Automated dependency updates:
- Weekly checks for npm dependencies
- Weekly checks for GitHub Actions
- Groups minor/patch updates

## Build Artifacts

### Published Files

Each package publishes only:
- `dist/` - Compiled JavaScript and type definitions
- `package.json` - Package metadata
- `README.md` - Package documentation

### Excluded Files

Not published:
- Source files (`src/`)
- Test files (`__tests__/`, `*.test.ts`)
- Build configs (`tsconfig.json`, `tsup.config.ts`)
- Development files

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Watch mode for development
npm run dev

# Run tests
npm test

# Type check
npm run typecheck
```

### Adding a New Package

1. Create package directory in `packages/`
2. Add `package.json` with proper metadata
3. Add `tsconfig.json` extending base config
4. Add `tsup.config.ts` for build configuration
5. Add package to root `workspaces` in `package.json`
6. Add package to linked packages in `.changeset/config.json`

### Making Changes

1. Create feature branch
2. Make changes
3. Run `npm run build` to verify
4. Run `npm test` to verify tests
5. Create changeset: `npm run changeset`
6. Commit and create PR

## Troubleshooting

### Build Failures

**TypeScript errors:**
```bash
npm run typecheck
```

**Clean build:**
```bash
npm run clean
npm install
npm run build
```

**Dependency issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Publish Failures

**Check NPM authentication:**
```bash
npm whoami
```

**Verify package access:**
- Packages must be public or you need access
- Check `access: "public"` in `.changeset/config.json`

**Version conflicts:**
- Ensure version doesn't already exist on NPM
- Check `npm view @@ruijadom/telescope/core versions`

### Workspace Issues

**Link packages:**
```bash
npm install
```

**Verify workspace structure:**
```bash
npm ls --workspaces
```

## Performance

### Build Times

Typical build times on modern hardware:
- Clean build: ~5-10 seconds
- Incremental build: ~1-2 seconds per package
- Watch mode: <1 second for changes

### Optimization

- tsup uses esbuild for fast bundling
- Parallel builds across packages
- Incremental TypeScript compilation
- Source maps for debugging

## Security

### NPM Provenance

Packages are published with NPM provenance:
- Verifiable build attestations
- Links packages to source repository
- Requires `NPM_CONFIG_PROVENANCE=true`

### Dependency Scanning

- Dependabot for automated updates
- GitHub security advisories
- Regular `npm audit` checks

## Future Improvements

Potential enhancements:
- Add ESLint for code quality
- Add Prettier for formatting
- Add bundle size tracking
- Add performance benchmarks
- Add visual regression testing
- Add E2E testing in CI
