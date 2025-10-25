/**
 * ComponentDetector - Detects React components from DOM elements
 */

import type { ComponentData, ComponentTreeNode, TestIdAnalysisResult, MissingTestIdInfo } from '@ruijadom/telescope-core';

// React Fiber keys that might be present on DOM elements
const REACT_FIBER_KEYS = [
  '__reactFiber$',
  '__reactInternalInstance$',
];

export class ComponentDetector {
  /**
   * Detects React component from a DOM element using React Fiber
   */
  detectComponent(element: HTMLElement): ComponentData | null {
    try {
      const fiber = this.getFiberFromElement(element);
      if (!fiber) {
        console.warn('[Telescope] React Fiber not found on element. Make sure React DevTools is enabled.');
        return null;
      }

      return this.extractFromFiber(fiber, element);
    } catch (error) {
      console.error('[Telescope] Failed to detect component:', error);
      return null;
    }
  }

  /**
   * Gets React Fiber node from DOM element
   */
  private getFiberFromElement(element: HTMLElement): any {
    // Try to find React Fiber on the element
    for (const key of Object.keys(element)) {
      if (REACT_FIBER_KEYS.some(fiberKey => key.startsWith(fiberKey))) {
        return (element as any)[key];
      }
    }
    return null;
  }

  /**
   * Extracts component metadata from React Fiber node
   */
  private extractFromFiber(fiber: any, element: HTMLElement): ComponentData | null {
    // Walk up the fiber tree to find a component (not a DOM element)
    let currentFiber = fiber;
    while (currentFiber) {
      const componentName = this.getComponentName(currentFiber);
      
      if (componentName) {
        const sourceLocation = this.resolveSourceLocation(currentFiber);
        const props = this.extractProps(currentFiber);
        const testIds = this.findTestIds(element);
        const type = this.getComponentType(currentFiber);
        
        return {
          name: componentName,
          filePath: sourceLocation.filePath,
          lineNumber: sourceLocation.line,
          columnNumber: sourceLocation.column,
          props,
          testIds,
          type,
          instanceId: this.generateInstanceId(currentFiber),
        };
      }
      
      currentFiber = currentFiber.return;
    }
    
    return null;
  }

  /**
   * Gets component name from Fiber node
   */
  private getComponentName(fiber: any): string | null {
    if (!fiber.type) {
      return null;
    }

    // Function component
    if (typeof fiber.type === 'function') {
      return fiber.type.displayName || fiber.type.name || null;
    }

    // Class component
    if (fiber.type.prototype && fiber.type.prototype.isReactComponent) {
      return fiber.type.displayName || fiber.type.name || null;
    }

    // String type (DOM element like 'div', 'span')
    if (typeof fiber.type === 'string') {
      return null;
    }

    return null;
  }

  /**
   * Determines component type (functional or class)
   */
  private getComponentType(fiber: any): 'functional' | 'class' {
    if (fiber.type && fiber.type.prototype && fiber.type.prototype.isReactComponent) {
      return 'class';
    }
    return 'functional';
  }

  /**
   * Resolves source location using source maps and Fiber metadata
   */
  private resolveSourceLocation(fiber: any): { filePath: string; line: number; column: number } {
    // Try to get source location from Fiber's _debugSource (React DevTools data)
    if (fiber._debugSource) {
      return {
        filePath: fiber._debugSource.fileName || 'unknown',
        line: fiber._debugSource.lineNumber || 0,
        column: fiber._debugSource.columnNumber || 0,
      };
    }

    // Try to get from _debugOwner
    if (fiber._debugOwner && fiber._debugOwner._debugSource) {
      return {
        filePath: fiber._debugOwner._debugSource.fileName || 'unknown',
        line: fiber._debugOwner._debugSource.lineNumber || 0,
        column: fiber._debugOwner._debugSource.columnNumber || 0,
      };
    }

    // Fallback: try to parse from function source
    if (fiber.type && typeof fiber.type === 'function') {
      // This is a basic fallback - in production, source maps would be used
      return {
        filePath: this.extractFilePathFromStack(),
        line: 0,
        column: 0,
      };
    }

    return {
      filePath: 'unknown',
      line: 0,
      column: 0,
    };
  }

  /**
   * Attempts to extract file path from stack trace
   */
  private extractFilePathFromStack(): string {
    try {
      const stack = new Error().stack;
      if (!stack) return 'unknown';

      const lines = stack.split('\n');
      for (const line of lines) {
        // Look for file paths in stack trace
        const match = line.match(/\((.*?):\d+:\d+\)/);
        if (match && match[1] && !match[1].includes('node_modules')) {
          return match[1];
        }
      }
    } catch (error) {
      // Ignore errors
    }
    return 'unknown';
  }

  /**
   * Extracts props from component Fiber node
   */
  private extractProps(fiber: any): Record<string, any> {
    if (!fiber.memoizedProps) {
      return {};
    }

    const props: Record<string, any> = {};
    const memoizedProps = fiber.memoizedProps;

    // Filter out internal React props and children
    for (const key in memoizedProps) {
      if (key === 'children' || key.startsWith('__')) {
        continue;
      }

      const value = memoizedProps[key];
      
      // Serialize prop values safely
      try {
        if (typeof value === 'function') {
          props[key] = '[Function]';
        } else if (typeof value === 'object' && value !== null) {
          // Limit object depth to avoid circular references
          props[key] = this.serializeObject(value, 1);
        } else {
          props[key] = value;
        }
      } catch (error) {
        props[key] = '[Unserializable]';
      }
    }

    return props;
  }

  /**
   * Safely serializes objects with depth limit
   */
  private serializeObject(obj: any, depth: number, maxDepth: number = 2): any {
    if (depth > maxDepth) {
      return '[Object]';
    }

    if (Array.isArray(obj)) {
      return obj.slice(0, 5).map(item => {
        if (typeof item === 'object' && item !== null) {
          return this.serializeObject(item, depth + 1, maxDepth);
        }
        return item;
      });
    }

    const result: Record<string, any> = {};
    let count = 0;
    for (const key in obj) {
      if (count >= 10) break; // Limit number of properties
      
      const value = obj[key];
      if (typeof value === 'function') {
        result[key] = '[Function]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.serializeObject(value, depth + 1, maxDepth);
      } else {
        result[key] = value;
      }
      count++;
    }
    return result;
  }

  /**
   * Finds existing test IDs on element and its children
   */
  private findTestIds(element: HTMLElement): string[] {
    const testIds: string[] = [];
    const testIdAttributes = [
      'data-testid',
      'data-test-id',
      'data-qa',
      'data-test',
    ];

    // Check the element itself
    for (const attr of testIdAttributes) {
      const value = element.getAttribute(attr);
      if (value) {
        testIds.push(value);
      }
    }

    // Check immediate children (not deep scan to avoid performance issues)
    const children = element.querySelectorAll('[data-testid], [data-test-id], [data-qa], [data-test]');
    children.forEach((child) => {
      for (const attr of testIdAttributes) {
        const value = child.getAttribute(attr);
        if (value && !testIds.includes(value)) {
          testIds.push(value);
        }
      }
    });

    return testIds;
  }

  /**
   * Generates unique instance ID for component
   */
  private generateInstanceId(fiber: any): string {
    // Use fiber's key or index, combined with timestamp
    const key = fiber.key || '';
    const index = fiber.index || 0;
    const timestamp = Date.now();
    return `${key}-${index}-${timestamp}`;
  }

  /**
   * Builds component tree from React Fiber tree
   * Traverses the Fiber tree to construct hierarchical component structure
   */
  buildComponentTree(rootElement?: HTMLElement): ComponentTreeNode | null {
    try {
      // Find root fiber - either from provided element or from document root
      const element = rootElement || document.getElementById('root') || document.body;
      const fiber = this.getFiberFromElement(element as HTMLElement);
      
      if (!fiber) {
        console.warn('[Telescope] Could not find React Fiber root');
        return null;
      }

      // Find the actual root of the React tree
      const rootFiber = this.findRootFiber(fiber);
      
      // Build tree starting from root
      return this.buildTreeNode(rootFiber, null, 0);
    } catch (error) {
      console.error('[Telescope] Failed to build component tree:', error);
      return null;
    }
  }

  /**
   * Finds the root Fiber node by traversing up the tree
   */
  private findRootFiber(fiber: any): any {
    let current = fiber;
    
    // Traverse up to find root
    while (current.return) {
      current = current.return;
    }
    
    // If we're at a HostRoot, get its child
    if (current.tag === 3 && current.child) { // 3 is HostRoot tag
      return current.child;
    }
    
    return current;
  }

  /**
   * Recursively builds tree node from Fiber node
   */
  private buildTreeNode(fiber: any, parent: ComponentTreeNode | null, depth: number): ComponentTreeNode | null {
    if (!fiber) {
      return null;
    }

    // Try to extract component data from this fiber
    const componentData = this.extractComponentDataFromFiber(fiber);
    
    // If this is a component (not a DOM element), create a tree node
    if (componentData) {
      const node: ComponentTreeNode = {
        component: componentData,
        children: [],
        parent,
        depth,
        isExpanded: depth < 2, // Auto-expand first 2 levels
      };

      // Process children
      let child = fiber.child;
      while (child) {
        const childNode = this.buildTreeNode(child, node, depth + 1);
        if (childNode) {
          node.children.push(childNode);
        }
        child = child.sibling;
      }

      return node;
    } else {
      // If not a component, skip this node but process its children
      // This handles DOM elements and fragments
      const children: ComponentTreeNode[] = [];
      let child = fiber.child;
      
      while (child) {
        const childNode = this.buildTreeNode(child, parent, depth);
        if (childNode) {
          children.push(childNode);
        }
        child = child.sibling;
      }

      // If we have exactly one child, return it directly
      // Otherwise, we skip this level
      if (children.length === 1) {
        return children[0];
      } else if (children.length > 1 && parent) {
        // Multiple children at this level - add them all to parent
        return null; // Signal to add children directly
      }
      
      return null;
    }
  }

  /**
   * Extracts component data from Fiber without requiring a DOM element
   */
  private extractComponentDataFromFiber(fiber: any): ComponentData | null {
    const componentName = this.getComponentName(fiber);
    
    if (!componentName) {
      return null;
    }

    const sourceLocation = this.resolveSourceLocation(fiber);
    const props = this.extractProps(fiber);
    const type = this.getComponentType(fiber);
    
    // For tree building, we don't have a specific DOM element to scan for test IDs
    // So we'll leave testIds empty - they can be populated when a specific instance is selected
    return {
      name: componentName,
      filePath: sourceLocation.filePath,
      lineNumber: sourceLocation.line,
      columnNumber: sourceLocation.column,
      props,
      testIds: [],
      type,
      instanceId: this.generateInstanceId(fiber),
    };
  }

  /**
   * Scans for missing test IDs across all interactive elements
   * Traverses the component tree and identifies interactive elements without test IDs
   */
  scanForMissingTestIds(rootElement?: HTMLElement): TestIdAnalysisResult {
    try {
      const root = rootElement || document.getElementById('root') || document.body;
      
      // Find all interactive elements
      const interactiveElements = this.findInteractiveElements(root);
      
      const missingTestIds: MissingTestIdInfo[] = [];
      let withTestIds = 0;
      let withoutTestIds = 0;
      
      // Check each interactive element for test IDs
      for (const element of interactiveElements) {
        const hasTestId = this.hasTestId(element);
        
        if (hasTestId) {
          withTestIds++;
        } else {
          withoutTestIds++;
          
          // Get component data for this element
          const componentData = this.detectComponent(element);
          const elementType = this.getElementType(element);
          const elementRole = element.getAttribute('role') || undefined;
          const elementText = this.getElementText(element);
          
          missingTestIds.push({
            component: componentData || this.createFallbackComponentData(element),
            element,
            elementType,
            elementRole,
            elementText,
          });
        }
      }
      
      const totalInteractive = interactiveElements.length;
      const coveragePercentage = totalInteractive > 0 
        ? Math.round((withTestIds / totalInteractive) * 100) 
        : 0;
      
      return {
        totalInteractive,
        withTestIds,
        withoutTestIds,
        missingTestIds,
        coveragePercentage,
      };
    } catch (error) {
      console.error('[Telescope] Failed to scan for missing test IDs:', error);
      return {
        totalInteractive: 0,
        withTestIds: 0,
        withoutTestIds: 0,
        missingTestIds: [],
        coveragePercentage: 0,
      };
    }
  }

  /**
   * Finds all interactive elements in the DOM
   * Identifies buttons, inputs, links, forms, and other interactive elements
   */
  private findInteractiveElements(root: HTMLElement): HTMLElement[] {
    const interactiveSelectors = [
      'button',
      'a[href]',
      'input',
      'select',
      'textarea',
      'form',
      '[role="button"]',
      '[role="link"]',
      '[role="textbox"]',
      '[role="checkbox"]',
      '[role="radio"]',
      '[role="combobox"]',
      '[role="listbox"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[onclick]',
      '[tabindex]:not([tabindex="-1"])',
    ];
    
    const selector = interactiveSelectors.join(', ');
    const elements = root.querySelectorAll(selector);
    
    // Filter out elements that are hidden or disabled
    return Array.from(elements).filter((el) => {
      const element = el as HTMLElement;
      
      // Skip hidden elements
      if (element.offsetParent === null && element.style.display !== 'contents') {
        return false;
      }
      
      // Skip elements inside Hubble's own UI
      if (element.closest('#hubble-overlay, #hubble-tree-view, #hubble-analysis-panel')) {
        return false;
      }
      
      return true;
    }) as HTMLElement[];
  }

  /**
   * Checks if an element has a test ID attribute
   */
  private hasTestId(element: HTMLElement): boolean {
    const testIdAttributes = [
      'data-testid',
      'data-test-id',
      'data-qa',
      'data-test',
    ];
    
    return testIdAttributes.some(attr => element.hasAttribute(attr));
  }

  /**
   * Gets the type of an interactive element
   */
  private getElementType(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    
    // Check for specific input types
    if (tagName === 'input') {
      const type = element.getAttribute('type') || 'text';
      return `input[type="${type}"]`;
    }
    
    // Check for role attribute
    const role = element.getAttribute('role');
    if (role) {
      return `${tagName}[role="${role}"]`;
    }
    
    return tagName;
  }

  /**
   * Gets readable text content from an element
   */
  private getElementText(element: HTMLElement): string | undefined {
    // Try aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) {
      return ariaLabel.trim();
    }
    
    // Try text content (limit to first 50 characters)
    const textContent = element.textContent?.trim();
    if (textContent && textContent.length > 0) {
      return textContent.length > 50 
        ? textContent.substring(0, 50) + '...' 
        : textContent;
    }
    
    // Try placeholder for inputs
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      const placeholder = element.placeholder;
      if (placeholder) {
        return placeholder;
      }
    }
    
    // Try value for buttons
    if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
      const value = element.value;
      if (value) {
        return value;
      }
    }
    
    return undefined;
  }

  /**
   * Creates fallback component data when component detection fails
   */
  private createFallbackComponentData(element: HTMLElement): ComponentData {
    return {
      name: `<${element.tagName.toLowerCase()}>`,
      filePath: 'unknown',
      lineNumber: 0,
      columnNumber: 0,
      props: {},
      testIds: [],
      type: 'functional',
      instanceId: `fallback-${Date.now()}`,
    };
  }
}
