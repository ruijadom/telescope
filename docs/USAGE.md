# Telescope Usage Guide

This guide covers common workflows and best practices for using Telescope in your development process.

## Table of Contents

- [Getting Started](#getting-started)
- [Component Navigation Workflow](#component-navigation-workflow)
- [Test ID Generation Workflow](#test-id-generation-workflow)
- [Component Tree Exploration](#component-tree-exploration)
- [Test ID Analysis](#test-id-analysis)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Best Practices](#best-practices)
- [Tips and Tricks](#tips-and-tricks)

## Getting Started

### Prerequisites

Before using Telescope, ensure you have:

1. **Node.js 18+** installed
2. **Cursor editor** installed and in your PATH
3. A **React project** with Vite or Webpack

### Installation

Install Telescope in your project:

```bash
npm install --save-dev @ruijadom/telescope
```

### Configuration

Add the plugin to your build configuration:

**For Vite:**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { telescopePlugin } from '@@ruijadom/telescope/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    telescopePlugin()
  ]
});
```

**For Webpack:**

```javascript
// webpack.config.js
const { TelescopeWebpackPlugin } = require('@@ruijadom/telescope/webpack-plugin');

module.exports = {
  plugins: [
    new TelescopeWebpackPlugin()
  ]
};
```

### Starting Your Development Environment

Start your development server as usual:

```bash
npm run dev
```

Telescope automatically starts alongside your dev server. You should see a message in the console:

```
[Telescope] Server started on ws://localhost:3737
```

## Component Navigation Workflow

The component navigation workflow helps you quickly jump from a component in the browser to its source code in Cursor.

### Step 1: Activate Telescope

There are two ways to activate Telescope:

**Method 1: Keyboard Modifier (Recommended)**

1. Hold down `Ctrl` (or `Cmd` on Mac)
2. Your cursor will change to indicate Telescope is active
3. Hover over components to see them highlighted

**Method 2: Keyboard Shortcut**

1. Press `Ctrl+Shift+H` (or `Cmd+Shift+H` on Mac) to toggle Telescope mode
2. Telescope stays active until you toggle it off

### Step 2: Select a Component

With Telescope active:

1. Click on any component in your application
2. An overlay appears showing component information:
   - Component name
   - File path
   - Line number
   - Props (current values)
   - Existing test IDs

### Step 3: Navigate to Source

From the overlay, you have several options:

**Open in Cursor:**
- Click the "Open in Cursor" button
- Cursor opens the file at the exact component location
- Your cursor is positioned at the component definition

**Copy File Path:**
- Click the file path to copy it to clipboard
- Useful for sharing or manual navigation

**View in Tree:**
- Click "View in Tree" to see the component in the component hierarchy
- Helps understand the component's context

### Example Workflow

```
1. You're viewing your app in the browser
2. You see a button that needs modification
3. Hold Ctrl and click the button
4. Overlay shows: "SubmitButton" at src/components/SubmitButton.tsx:15
5. Click "Open in Cursor"
6. Cursor opens with your cursor at line 15 of SubmitButton.tsx
7. Make your changes and save
8. Hot reload updates the browser automatically
```

### Tips for Component Navigation

- **Nested Components**: If you click on a deeply nested component, Telescope detects the most specific component at that location
- **Multiple Components**: If multiple components render at the same location, use the component tree to navigate between them
- **Third-Party Components**: Telescope works with third-party component libraries, but source navigation depends on source maps being available
- **Memoized Components**: React.memo() wrapped components are detected correctly

## Test ID Generation Workflow

The test ID generation workflow uses AI to automatically suggest and insert test IDs into your components.

### When to Use Test ID Generation

Use test ID generation when:

- Adding test IDs to new components
- Improving test coverage in existing components
- Standardizing test ID conventions across your codebase
- Onboarding new team members who need to learn your test ID patterns

### Step 1: Select a Component

1. Activate Telescope (hold Ctrl/Cmd)
2. Click on a component that needs test IDs
3. The overlay shows existing test IDs (if any)

### Step 2: Generate Test IDs

From the overlay:

1. Click the "Generate Test IDs" button
2. Telescope analyzes your component structure
3. AI generates contextual test ID suggestions
4. A panel appears showing all suggestions

### Step 3: Review Suggestions

The suggestions panel shows:

- **Element Type**: What kind of element (button, input, etc.)
- **Suggested ID**: The proposed test ID value
- **Reason**: Why this test ID was suggested
- **Location**: Where it will be inserted (line number)

Example suggestions:

```
Button (line 23)
  ID: submit-form-button
  Reason: Primary action button for form submission
  
Input (line 18)
  ID: email-input-field
  Reason: Email input field in user registration form
  
Link (line 31)
  ID: cancel-action-link
  Reason: Secondary action to cancel form submission
```

### Step 4: Approve and Insert

You have several options:

**Insert All:**
- Click "Insert All" to add all suggested test IDs
- All test IDs are inserted into your source file
- File is automatically saved

**Insert Individually:**
- Click the checkmark next to each suggestion to insert it
- Useful when you want to be selective

**Edit Before Inserting:**
- Click the edit icon to modify a suggestion
- Change the test ID value to match your preference
- Click checkmark to insert the modified version

**Reject:**
- Click the X icon to reject a suggestion
- Useful for elements that don't need test IDs

### Step 5: Verify Changes

After insertion:

1. Check your source file in Cursor (it should already be open)
2. Verify the test IDs are correctly placed
3. Ensure formatting and indentation are preserved
4. The browser automatically reloads with the new test IDs

### Example Workflow

```
1. You're building a login form
2. Hold Ctrl and click the form component
3. Overlay shows: "LoginForm" with 0 test IDs
4. Click "Generate Test IDs"
5. AI suggests:
   - email-input (for email field)
   - password-input (for password field)
   - login-button (for submit button)
   - forgot-password-link (for reset link)
6. Review suggestions - they all look good
7. Click "Insert All"
8. Open LoginForm.tsx in Cursor to see the changes
9. All test IDs are now in place with proper formatting
```

### Test ID Conventions

Telescope automatically detects your project's test ID convention by scanning existing code. It supports:

- `data-testid` (most common)
- `data-test-id`
- `data-qa`
- `data-cy` (Cypress)
- Custom patterns

The AI uses your detected convention when generating suggestions.

### Customizing Test ID Generation

You can customize test ID generation in `telescope.config.js`:

```javascript
module.exports = {
  testId: {
    // Use a specific convention
    convention: 'data-testid',
    
    // Or define a custom pattern
    convention: 'custom',
    customPattern: 'data-qa-{componentName}-{elementType}',
    
    // Auto-generate test IDs on component creation
    autoGenerate: false
  },
  
  ai: {
    enabled: true,
    provider: 'cursor-native',
    
    // Or use external AI providers
    // provider: 'openai',
    // model: 'gpt-4',
    // apiKey: process.env.OPENAI_API_KEY
  }
};
```

## Component Tree Exploration

The component tree view helps you understand your application's component hierarchy.

### Opening the Component Tree

1. Activate Telescope
2. Click any component
3. In the overlay, click "View Tree" or press `T`
4. The component tree panel opens on the right side

### Understanding the Tree View

The tree view shows:

- **Component Hierarchy**: Parent-child relationships
- **Component Names**: Display names of all components
- **Current Selection**: Highlighted in the tree
- **Test ID Status**: Icons indicate which components have test IDs
  - ✓ Green checkmark: Has test IDs
  - ⚠ Yellow warning: Missing test IDs
  - ○ Gray circle: Not applicable (no interactive elements)

### Navigating the Tree

**Expand/Collapse:**
- Click the arrow icon to expand or collapse branches
- Double-click a component name to expand all children

**Select Components:**
- Click any component in the tree to select it
- The browser highlights the component
- The overlay updates with component information

**Jump to Source:**
- Right-click a component in the tree
- Select "Open in Cursor"
- Or click the file icon next to the component name

### Example Tree Structure

```
App
├── Header ✓
│   ├── Logo
│   ├── Navigation ✓
│   │   ├── NavLink ✓
│   │   ├── NavLink ✓
│   │   └── NavLink ✓
│   └── UserMenu ⚠
│       ├── Avatar
│       └── Dropdown ⚠
├── MainContent
│   ├── Sidebar ✓
│   └── ContentArea
│       ├── ArticleList ⚠
│       │   └── ArticleCard ⚠
│       └── Pagination ✓
└── Footer ✓
```

### Filtering the Tree

Use the search box at the top of the tree panel:

- Type a component name to filter
- Only matching components and their ancestors are shown
- Clear the search to see the full tree again

### Tree View Tips

- **Find Parent Components**: Use the tree to identify which component is the parent of the one you're working on
- **Understand Composition**: See how components are composed together
- **Identify Patterns**: Spot repeated component patterns in your app
- **Test ID Coverage**: Quickly see which areas of your app need test IDs

## Test ID Analysis

The test ID analysis feature helps you identify components that are missing test IDs.

### Running an Analysis

1. Activate Telescope
2. Click any component (or use the tree view)
3. In the overlay, click "Analyze Test IDs"
4. The analysis panel opens showing results

### Understanding the Analysis Report

The report shows:

**Summary Statistics:**
- Total interactive elements found
- Elements with test IDs
- Elements without test IDs
- Coverage percentage

**Component List:**
- All components sorted by test ID status
- Components without test IDs are listed first
- Each entry shows:
  - Component name
  - File path
  - Number of missing test IDs
  - Interactive element types

### Example Analysis Report

```
Test ID Coverage Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Summary
  Total Interactive Elements: 47
  With Test IDs: 23 (49%)
  Without Test IDs: 24 (51%)

Components Missing Test IDs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ UserProfile (src/components/UserProfile.tsx)
  Missing: 3 test IDs
  Elements: 2 buttons, 1 input
  [Generate Test IDs] [Open in Cursor]

⚠ TodoList (src/components/TodoList.tsx)
  Missing: 5 test IDs
  Elements: 3 buttons, 1 input, 1 form
  [Generate Test IDs] [Open in Cursor]

⚠ SearchBar (src/components/SearchBar.tsx)
  Missing: 2 test IDs
  Elements: 1 input, 1 button
  [Generate Test IDs] [Open in Cursor]

Components With Test IDs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Header (src/components/Header.tsx)
  Test IDs: 4
  
✓ Navigation (src/components/Navigation.tsx)
  Test IDs: 6
```

### Taking Action from the Report

For each component in the report, you can:

**Generate Test IDs:**
- Click "Generate Test IDs" to start the AI generation workflow
- Review and insert suggestions as described above

**Open in Cursor:**
- Click "Open in Cursor" to manually add test IDs
- Useful when you want full control over test ID naming

**Navigate in Browser:**
- Click the component name to highlight it in the browser
- Helps you understand what the component does

### Exporting the Report

You can export the analysis report:

1. Click "Export Report" at the bottom of the panel
2. Choose format:
   - **JSON**: For programmatic processing
   - **CSV**: For spreadsheets
   - **Markdown**: For documentation

### Continuous Monitoring

Set up continuous test ID monitoring:

```javascript
// telescope.config.js
module.exports = {
  testId: {
    // Warn when coverage drops below threshold
    coverageThreshold: 80,
    
    // Show warning in overlay for components without test IDs
    warnOnMissing: true
  }
};
```

## Keyboard Shortcuts

Telescope supports several keyboard shortcuts for faster workflows.

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Click` | Activate Telescope and select component |
| `Ctrl/Cmd + Shift + H` | Toggle Telescope mode on/off |
| `Esc` | Close overlay or panel |

### Overlay Shortcuts

When the overlay is open:

| Shortcut | Action |
|----------|--------|
| `O` | Open component in Cursor |
| `G` | Generate test IDs |
| `T` | Open component tree view |
| `A` | Open test ID analysis |
| `C` | Copy file path to clipboard |
| `Arrow Keys` | Navigate between overlay buttons |
| `Enter` | Activate focused button |

### Tree View Shortcuts

When the tree view is open:

| Shortcut | Action |
|----------|--------|
| `Arrow Up/Down` | Navigate between components |
| `Arrow Right` | Expand component |
| `Arrow Left` | Collapse component |
| `Enter` | Select component |
| `Ctrl/Cmd + F` | Focus search box |
| `Ctrl/Cmd + O` | Open selected component in Cursor |

### Analysis Panel Shortcuts

When the analysis panel is open:

| Shortcut | Action |
|----------|--------|
| `Arrow Up/Down` | Navigate between components |
| `G` | Generate test IDs for selected component |
| `O` | Open selected component in Cursor |
| `E` | Export report |

### Customizing Shortcuts

You can customize keyboard shortcuts in `telescope.config.js`:

```javascript
module.exports = {
  shortcuts: {
    activate: 'ctrl+click',
    toggle: 'ctrl+shift+h',
    openInEditor: 'o',
    generateTestIds: 'g',
    viewTree: 't',
    analyze: 'a'
  }
};
```

## Best Practices

### Component Navigation

**Do:**
- Use Ctrl+Click for quick, one-off component inspections
- Use the component tree for understanding complex hierarchies
- Keep your source maps enabled in development
- Navigate to components before making changes to understand context

**Don't:**
- Don't rely on Telescope in production (it's automatically disabled)
- Don't click on non-React elements (they won't be detected)
- Don't expect it to work with heavily minified code

### Test ID Generation

**Do:**
- Review AI suggestions before inserting them
- Use consistent naming conventions across your project
- Generate test IDs for all interactive elements
- Run test ID analysis regularly to maintain coverage

**Don't:**
- Don't blindly accept all suggestions without review
- Don't use test IDs for styling (use classes instead)
- Don't generate test IDs for non-interactive elements
- Don't overwrite existing test IDs without checking tests first

### Project Organization

**Do:**
- Create a `telescope.config.js` file to document your conventions
- Share the config file with your team via version control
- Set up test ID coverage thresholds for your project
- Document your test ID naming patterns

**Don't:**
- Don't use different conventions in different parts of your app
- Don't commit API keys to version control
- Don't disable Telescope for the whole team if only you don't need it

### Team Collaboration

**Do:**
- Establish team-wide test ID conventions
- Use Telescope during code reviews to quickly navigate
- Share interesting component discoveries with your team
- Document complex component hierarchies using the tree view

**Don't:**
- Don't assume everyone uses the same editor (configure accordingly)
- Don't generate test IDs without coordinating with QA team
- Don't change test ID conventions without updating tests

## Tips and Tricks

### Tip 1: Quick Component Discovery

When exploring an unfamiliar codebase:

1. Open the app in the browser
2. Toggle Telescope mode on (Ctrl+Shift+H)
3. Click through the UI to understand component structure
4. Use the tree view to see the big picture
5. Open interesting components in Cursor to read the code

### Tip 2: Batch Test ID Generation

To add test IDs to multiple components quickly:

1. Run test ID analysis (click "Analyze Test IDs")
2. Sort by components with most missing test IDs
3. Work through the list from top to bottom
4. Use "Generate Test IDs" → "Insert All" for each component
5. Review changes in Cursor after batch insertion

### Tip 3: Component Debugging

When debugging a component issue:

1. Reproduce the issue in the browser
2. Ctrl+Click the problematic component
3. Check the props in the overlay (are they what you expect?)
4. Open in Cursor to see the implementation
5. Set breakpoints and debug as needed

### Tip 4: Learning React Patterns

To learn how experienced developers structure components:

1. Open a well-built React app
2. Use the component tree to explore the structure
3. Click on components to see their implementation
4. Note patterns like composition, prop drilling, context usage
5. Apply these patterns in your own code

### Tip 5: Onboarding New Developers

Help new team members get up to speed:

1. Have them install Telescope
2. Show them how to navigate from UI to code
3. Use the tree view to explain the app architecture
4. Demonstrate test ID generation to teach conventions
5. Let them explore the codebase interactively

### Tip 6: Code Review Efficiency

During code reviews:

1. Check out the PR branch
2. Run the dev server
3. Use Telescope to navigate to changed components
4. Review changes in context of the full component
5. Check if test IDs were added for new interactive elements

### Tip 7: Refactoring Assistance

When refactoring components:

1. Use the tree view to understand current structure
2. Identify components that should be split or combined
3. Check test ID coverage before refactoring
4. Refactor the components
5. Use Telescope to verify the new structure
6. Regenerate test IDs if component structure changed significantly

### Tip 8: Documentation

Create visual documentation of your component hierarchy:

1. Open the component tree view
2. Take screenshots of different sections
3. Export test ID analysis reports
4. Include these in your project documentation
5. Update periodically as the app evolves

### Tip 9: Performance Optimization

Identify components that re-render frequently:

1. Enable React DevTools Profiler
2. Use Telescope to quickly navigate to components
3. Check if components should be memoized
4. Add React.memo() or useMemo() as needed
5. Verify improvements with the Profiler

### Tip 10: Accessibility Improvements

Ensure interactive elements are properly identified:

1. Run test ID analysis
2. Components without test IDs likely need accessibility improvements
3. Add test IDs and ARIA labels together
4. Use the analysis report to track progress
5. Aim for 100% coverage of interactive elements

## Troubleshooting Common Issues

### Issue: Overlay appears in wrong position

**Solution:**
- Check if your app uses CSS transforms on parent elements
- Try clicking the component again
- Refresh the page and try again

### Issue: Component tree shows unexpected structure

**Solution:**
- This reflects the actual React component tree (not DOM tree)
- Some components may be wrapped by HOCs or context providers
- Use React DevTools to verify the structure

### Issue: Test ID suggestions don't match your conventions

**Solution:**
- Check your `telescope.config.js` test ID convention setting
- Ensure you have existing test IDs in your codebase for detection
- Manually specify the convention if auto-detection fails

### Issue: Cursor opens but cursor is not at the right line

**Solution:**
- Verify source maps are enabled and accurate
- Check that your build tool is generating source maps
- Try rebuilding your project

### Issue: AI test ID generation is slow

**Solution:**
- Check your network connection (for external AI providers)
- Verify API rate limits haven't been exceeded
- Consider switching to Cursor's native AI for faster responses

## Advanced Workflows

### Workflow 1: Component Audit

Audit all components in a feature:

1. Navigate to the feature in the browser
2. Open component tree view
3. Expand all components in the feature
4. For each component:
   - Check test ID coverage
   - Verify naming conventions
   - Review component structure
5. Generate missing test IDs
6. Document findings

### Workflow 2: Test ID Migration

Migrate from one test ID convention to another:

1. Update `telescope.config.js` with new convention
2. Run test ID analysis to see current state
3. For each component with old convention:
   - Open in Cursor
   - Remove old test IDs
   - Generate new test IDs with Telescope
   - Update corresponding tests
4. Verify all tests still pass

### Workflow 3: Component Discovery Session

Explore a new codebase with your team:

1. Share screen with team
2. Open the app in browser
3. Use Telescope to navigate through features
4. Discuss component structure and patterns
5. Document key components and their relationships
6. Create a component map for reference

## Getting Help

If you need help with Telescope:

- Check the [API Documentation](./API.md)
- Read the [Main README](../README.md)
- Search [GitHub Issues](https://github.com/yourusername/@ruijadom/telescope/issues)
- Ask in [GitHub Discussions](https://github.com/yourusername/@ruijadom/telescope/discussions)

## Next Steps

Now that you understand how to use Telescope:

1. Try the [example applications](../examples)
2. Read the [API documentation](./API.md) for advanced usage
3. Customize your [configuration](../README.md#configuration)
4. Share Telescope with your team

Happy coding! 🚀
