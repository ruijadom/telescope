/**
 * Telescope Browser Runtime
 * Component detection and overlay UI for browser
 */

import { ComponentDetector } from './detector';
import { TelescopeClient } from './client';
import { ComponentOverlay } from './overlay';
import { TreeView } from './tree-view';
import { AnalysisPanel } from './analysis-panel';

// Global state
let isTelescopeActive = false;
let detector: ComponentDetector;
let client: TelescopeClient;
let overlay: ComponentOverlay;
let treeView: TreeView;
let analysisPanel: AnalysisPanel;
let currentHighlight: HTMLElement | null = null;

/**
 * Initializes Telescope browser runtime
 */
function initialize(): void {
  console.log('[Telescope] Initializing browser runtime...');

  // Create instances
  detector = new ComponentDetector();
  client = new TelescopeClient();
  treeView = new TreeView(client);
  analysisPanel = new AnalysisPanel(client);
  overlay = new ComponentOverlay(client, toggleTreeView, analyzeTestIds);

  // Connect to server
  client.connect().catch(error => {
    console.warn('[Telescope] Failed to connect to server:', error);
    console.log('[Telescope] Will retry connection when needed');
  });

  // Set up keyboard shortcut (Ctrl+Click or Cmd+Click)
  setupKeyboardShortcut();

  // Set up click event listener
  setupClickListener();

  // Set up hover effect
  setupHoverListener();

  console.log('[Telescope] Browser runtime initialized. Press Ctrl/Cmd+Shift to activate.');
}

/**
 * Sets up keyboard shortcut to activate component selection mode
 */
function setupKeyboardShortcut(): void {
  document.addEventListener('keydown', (event) => {
    // Activate on Ctrl+Shift or Cmd+Shift
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      if (!isTelescopeActive) {
        activateTelescope();
      }
    }
  });

  document.addEventListener('keyup', (event) => {
    // Deactivate when modifier keys are released
    if (!event.ctrlKey && !event.metaKey) {
      if (isTelescopeActive) {
        deactivateTelescope();
      }
    }
  });

  // Also deactivate on Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (isTelescopeActive) {
        deactivateTelescope();
        overlay.hide();
      }
      treeView.hide();
      analysisPanel.hide();
    }
  });

  // Show tree view with Ctrl/Cmd+Shift+T
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'T') {
      event.preventDefault();
      toggleTreeView();
    }
  });

  // Show test ID analysis with Ctrl/Cmd+Shift+A
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
      event.preventDefault();
      analyzeTestIds();
    }
  });
}

/**
 * Sets up click event listener for component detection
 */
function setupClickListener(): void {
  document.addEventListener('click', (event) => {
    if (!isTelescopeActive) {
      return;
    }

    // Prevent default action and stop propagation
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;

    // Ignore clicks on Hubble overlay
    if (target.closest('#hubble-overlay')) {
      return;
    }

    // Detect component
    const componentData = detector.detectComponent(target);

    if (componentData) {
      console.log('[Telescope] Component detected:', componentData);
      
      // Show overlay at click position
      overlay.show(componentData, { x: event.clientX, y: event.clientY });

      // Highlight in tree view if open
      const treeElement = document.getElementById('hubble-tree-view');
      if (treeElement) {
        treeView.highlightComponent(componentData.instanceId);
      }

      // Send component-selected message to server
      client.send({
        type: 'component-selected',
        payload: componentData,
      }).catch(error => {
        console.error('[Telescope] Failed to send component-selected message:', error);
      });
    } else {
      console.log('[Telescope] No React component found at this element');
    }
  }, true); // Use capture phase to intercept before other handlers
}

/**
 * Sets up hover listener to highlight elements
 */
function setupHoverListener(): void {
  document.addEventListener('mousemove', (event) => {
    if (!isTelescopeActive) {
      removeHighlight();
      return;
    }

    const target = event.target as HTMLElement;

    // Ignore Hubble overlay
    if (target.closest('#hubble-overlay') || target.closest('#hubble-highlight')) {
      return;
    }

    // Highlight element
    highlightElement(target);
  });
}

/**
 * Highlights an element with a border
 */
function highlightElement(element: HTMLElement): void {
  removeHighlight();

  const rect = element.getBoundingClientRect();
  
  currentHighlight = document.createElement('div');
  currentHighlight.id = 'hubble-highlight';
  currentHighlight.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999998;
    border: 2px solid #3b82f6;
    background: rgba(59, 130, 246, 0.1);
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
  `;
  
  document.body.appendChild(currentHighlight);
}

/**
 * Removes highlight element
 */
function removeHighlight(): void {
  if (currentHighlight) {
    currentHighlight.remove();
    currentHighlight = null;
  }
}

/**
 * Activates Hubble component selection mode
 */
function activateTelescope(): void {
  isTelescopeActive = true;
  document.body.style.cursor = 'crosshair';
  console.log('[Telescope] Activated - Click on any component to inspect');
  
  // Show activation indicator
  showActivationIndicator();
}

/**
 * Deactivates Hubble component selection mode
 */
function deactivateTelescope(): void {
  isTelescopeActive = false;
  document.body.style.cursor = '';
  removeHighlight();
  hideActivationIndicator();
  console.log('[Telescope] Deactivated');
}

/**
 * Shows activation indicator
 */
function showActivationIndicator(): void {
  const indicator = document.createElement('div');
  indicator.id = 'hubble-indicator';
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    background: #3b82f6;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    pointer-events: none;
  `;
  
  const text = document.createElement('div');
  text.textContent = '⚛️ Hubble Active - Click to inspect';
  indicator.appendChild(text);
  
  const hint = document.createElement('div');
  hint.style.cssText = `
    font-size: 11px;
    margin-top: 4px;
    opacity: 0.9;
  `;
  hint.textContent = 'Ctrl+Shift+T: Tree | Ctrl+Shift+A: Analyze';
  indicator.appendChild(hint);
  
  document.body.appendChild(indicator);
}

/**
 * Hides activation indicator
 */
function hideActivationIndicator(): void {
  const indicator = document.getElementById('hubble-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Toggles component tree view
 */
function toggleTreeView(): void {
  const existingTree = document.getElementById('hubble-tree-view');
  
  if (existingTree) {
    treeView.hide();
    return;
  }

  console.log('[Telescope] Building component tree...');
  
  const rootNode = detector.buildComponentTree();
  
  if (rootNode) {
    treeView.show(rootNode);
    console.log('[Telescope] Component tree displayed');
  } else {
    console.error('[Telescope] Failed to build component tree');
    alert('Failed to build component tree. Make sure you have a React application running.');
  }
}

/**
 * Analyzes test IDs across the application
 */
function analyzeTestIds(): void {
  console.log('[Telescope] Analyzing test IDs...');
  
  const analysisResult = detector.scanForMissingTestIds();
  
  console.log('[Telescope] Analysis complete:', analysisResult);
  
  analysisPanel.show(analysisResult);
}

/**
 * Checks if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Auto-initialize when script loads in browser
if (isBrowser()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
}

// Export for manual initialization if needed
export { initialize, ComponentDetector, TelescopeClient, ComponentOverlay, TreeView, AnalysisPanel };
export type { ComponentData, ComponentTreeNode, TestIdAnalysisResult, MissingTestIdInfo } from '@ruijadom/telescope-core';
