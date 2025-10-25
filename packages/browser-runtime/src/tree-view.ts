/**
 * TreeView - Component tree visualization UI
 */

import type { ComponentTreeNode } from '@ruijadom/telescope-core';
import type { TelescopeClient } from './client';

export class TreeView {
  private treeElement: HTMLElement | null = null;
  private client: TelescopeClient;

  constructor(client: TelescopeClient) {
    this.client = client;
  }

  /**
   * Shows tree view with component hierarchy
   */
  show(rootNode: ComponentTreeNode): void {
    // Remove existing tree if present
    this.hide();

    // Create and render tree view
    this.treeElement = this.render(rootNode);
    document.body.appendChild(this.treeElement);
  }

  /**
   * Hides and removes tree view from DOM
   */
  hide(): void {
    if (this.treeElement) {
      this.treeElement.remove();
      this.treeElement = null;
    }
  }

  /**
   * Highlights a specific component in the tree
   */
  highlightComponent(instanceId: string): void {
    if (!this.treeElement) return;

    // Remove previous highlight
    const previousHighlight = this.treeElement.querySelector('.tree-node-highlighted');
    if (previousHighlight) {
      previousHighlight.classList.remove('tree-node-highlighted');
    }

    // Add highlight to new node
    const nodeElement = this.treeElement.querySelector(`[data-instance-id="${instanceId}"]`);
    if (nodeElement) {
      nodeElement.classList.add('tree-node-highlighted');
      nodeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Renders tree view HTML
   */
  private render(rootNode: ComponentTreeNode): HTMLElement {
    const container = document.createElement('div');
    container.id = 'hubble-tree-view';
    container.style.cssText = `
      position: fixed;
      top: 60px;
      right: 20px;
      z-index: 999999;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      width: 320px;
      max-height: 600px;
      display: flex;
      flex-direction: column;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #1f2937;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;

    const title = document.createElement('span');
    title.textContent = '🌳 Component Tree';
    header.appendChild(title);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      background: transparent;
      border: none;
      font-size: 24px;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    `;
    closeButton.onmouseover = () => {
      closeButton.style.background = '#f3f4f6';
      closeButton.style.color = '#374151';
    };
    closeButton.onmouseout = () => {
      closeButton.style.background = 'transparent';
      closeButton.style.color = '#9ca3af';
    };
    closeButton.onclick = () => this.hide();
    header.appendChild(closeButton);

    container.appendChild(header);

    // Tree content (scrollable)
    const treeContent = document.createElement('div');
    treeContent.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    `;

    // Render tree nodes
    this.renderTreeNode(rootNode, treeContent);

    container.appendChild(treeContent);

    return container;
  }

  /**
   * Recursively renders tree nodes
   */
  private renderTreeNode(node: ComponentTreeNode, parentElement: HTMLElement): void {
    const nodeContainer = document.createElement('div');
    nodeContainer.style.cssText = `
      margin-left: ${node.depth * 16}px;
    `;

    // Node element
    const nodeElement = document.createElement('div');
    nodeElement.className = 'tree-node';
    nodeElement.setAttribute('data-instance-id', node.component.instanceId);
    nodeElement.style.cssText = `
      padding: 6px 8px;
      margin: 2px 0;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s;
      user-select: none;
    `;

    // Hover effect
    nodeElement.onmouseover = () => {
      if (!nodeElement.classList.contains('tree-node-highlighted')) {
        nodeElement.style.background = '#f3f4f6';
      }
    };
    nodeElement.onmouseout = () => {
      if (!nodeElement.classList.contains('tree-node-highlighted')) {
        nodeElement.style.background = 'transparent';
      }
    };

    // Click handler - navigate to component source
    nodeElement.onclick = (e) => {
      e.stopPropagation();
      this.handleNodeClick(node);
    };

    // Expand/collapse button (if has children)
    if (node.children.length > 0) {
      const expandButton = document.createElement('span');
      expandButton.style.cssText = `
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #6b7280;
        cursor: pointer;
      `;
      expandButton.textContent = node.isExpanded ? '▼' : '▶';
      
      expandButton.onclick = (e) => {
        e.stopPropagation();
        this.toggleNode(node, nodeContainer);
      };
      
      nodeElement.appendChild(expandButton);
    } else {
      // Spacer for alignment
      const spacer = document.createElement('span');
      spacer.style.cssText = 'width: 16px;';
      nodeElement.appendChild(spacer);
    }

    // Component icon
    const icon = document.createElement('span');
    icon.textContent = '⚛️';
    icon.style.fontSize = '14px';
    nodeElement.appendChild(icon);

    // Component name
    const name = document.createElement('span');
    name.textContent = node.component.name;
    name.style.cssText = `
      flex: 1;
      color: #374151;
      font-weight: 500;
    `;
    nodeElement.appendChild(name);

    // Component type badge
    const typeBadge = document.createElement('span');
    typeBadge.textContent = node.component.type === 'class' ? 'C' : 'F';
    typeBadge.style.cssText = `
      font-size: 10px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 2px 4px;
      border-radius: 3px;
      font-weight: 600;
    `;
    typeBadge.title = node.component.type === 'class' ? 'Class Component' : 'Functional Component';
    nodeElement.appendChild(typeBadge);

    nodeContainer.appendChild(nodeElement);

    // Children container
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'tree-children';
    childrenContainer.style.display = node.isExpanded ? 'block' : 'none';

    // Render children
    for (const child of node.children) {
      this.renderTreeNode(child, childrenContainer);
    }

    nodeContainer.appendChild(childrenContainer);
    parentElement.appendChild(nodeContainer);

    // Add CSS for highlighted state
    const style = document.createElement('style');
    style.textContent = `
      .tree-node-highlighted {
        background: #dbeafe !important;
        border-left: 3px solid #3b82f6;
        padding-left: 5px !important;
      }
    `;
    if (!document.getElementById('hubble-tree-styles')) {
      style.id = 'hubble-tree-styles';
      document.head.appendChild(style);
    }
  }

  /**
   * Toggles expand/collapse state of a node
   */
  private toggleNode(node: ComponentTreeNode, nodeContainer: HTMLElement): void {
    node.isExpanded = !node.isExpanded;

    // Update expand button
    const expandButton = nodeContainer.querySelector('.tree-node span:first-child') as HTMLElement;
    if (expandButton) {
      expandButton.textContent = node.isExpanded ? '▼' : '▶';
    }

    // Toggle children visibility
    const childrenContainer = nodeContainer.querySelector('.tree-children') as HTMLElement;
    if (childrenContainer) {
      childrenContainer.style.display = node.isExpanded ? 'block' : 'none';
    }
  }

  /**
   * Handles click on tree node - navigates to component source
   */
  private handleNodeClick(node: ComponentTreeNode): void {
    console.log('[Telescope] Tree node clicked:', node.component.name);
    
    // Highlight the selected node
    this.highlightComponent(node.component.instanceId);

    // Send open-editor command
    this.client.send({
      type: 'open-editor',
      payload: {
        filePath: node.component.filePath,
        line: node.component.lineNumber,
        column: node.component.columnNumber,
        componentData: node.component,
      },
    }).then(() => {
      console.log('[Telescope] Open editor request sent from tree view');
    }).catch(error => {
      console.error('[Telescope] Failed to open editor from tree view:', error);
      alert(`Failed to open editor: ${error.message}`);
    });
  }
}
