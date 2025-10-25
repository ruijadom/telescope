import type { LoaderContext } from 'webpack';

/**
 * Webpack loader for transforming React components
 * Adds component metadata for Hubble detection
 */
export default function reactHubbleLoader(
  this: LoaderContext<any>,
  source: string
): string {
  // Get file path for metadata
  const filePath = this.resourcePath;

  // Check if this is a React component file
  const isReactFile = /\.(jsx|tsx)$/.test(filePath);
  const isInNodeModules = filePath.includes('node_modules');

  // Skip non-React files and node_modules
  if (!isReactFile || isInNodeModules) {
    return source;
  }

  // Check if file contains React components
  const hasReactComponent =
    /(?:function|const|class)\s+\w+.*(?:React\.Component|:\s*React\.FC|:\s*FC)/.test(
      source
    ) || /export\s+(?:default\s+)?(?:function|const|class)/.test(source);

  if (!hasReactComponent) {
    return source;
  }

  try {
    // Transform component to add metadata
    const transformedCode = transformComponent(source, filePath);

    // Preserve source maps by using this.callback
    // This allows Webpack to maintain accurate source map chains
    const sourceMap = typeof this.sourceMap === 'boolean' ? undefined : this.sourceMap;
    this.callback(null, transformedCode, sourceMap);

    return transformedCode;
  } catch (error) {
    // Log error but don't break the build
    console.warn(`[Telescope] Failed to transform ${filePath}:`, error);
    return source;
  }
}

/**
 * Transform component code to add metadata
 * Uses a lightweight approach that preserves source maps
 */
function transformComponent(code: string, _filePath: string): string {
  // For now, we'll use a simple approach that doesn't modify the code
  // The browser runtime will use React Fiber and source maps for detection
  // This keeps the transformation minimal and preserves source maps

  // In the future, we could add metadata comments or inject properties
  // But for MVP, source maps provide sufficient location information

  // Future enhancements could include:
  // 1. Parse component AST using Babel or SWC
  // 2. Add __HUBBLE_METADATA__ property to components
  // 3. Include file path and line number
  // 4. Generate accurate source maps
  // 5. Inject metadata as component properties
  // 6. Add development-only metadata that gets stripped in production

  // For now, return the original code unchanged
  // The source maps will provide the necessary location information
  return code;
}
