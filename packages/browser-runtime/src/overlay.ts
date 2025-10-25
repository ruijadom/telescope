/**
 * ComponentOverlay - UI overlay for displaying component information
 */

import type { ComponentData } from '@ruijadom/telescope-core';
import type { TelescopeClient } from './client';

export class ComponentOverlay {
    private overlayElement: HTMLElement | null = null;
    private client: TelescopeClient;
    private onShowTreeView?: () => void;
    private onAnalyzeTestIds?: () => void;

    constructor(client: TelescopeClient, onShowTreeView?: () => void, onAnalyzeTestIds?: () => void) {
        this.client = client;
        this.onShowTreeView = onShowTreeView;
        this.onAnalyzeTestIds = onAnalyzeTestIds;
    }

    /**
     * Shows overlay with component information at cursor position
     */
    show(componentData: ComponentData, position: { x: number; y: number }): void {
        // Remove existing overlay if present
        this.hide();

        // Create and render overlay
        this.overlayElement = this.render(componentData);
        document.body.appendChild(this.overlayElement);

        // Position overlay near cursor
        this.positionOverlay(position);
    }

    /**
     * Hides and removes overlay from DOM
     */
    hide(): void {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
    }

    /**
     * Renders overlay HTML with component information
     */
    private render(componentData: ComponentData): HTMLElement {
        const overlay = document.createElement('div');
        overlay.id = 'hubble-overlay';
        overlay.style.cssText = `
      position: fixed;
      z-index: 999999;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 400px;
      min-width: 300px;
    `;

        // Component name header
        const header = document.createElement('div');
        header.style.cssText = `
      font-weight: 600;
      font-size: 16px;
      color: #1f2937;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

        const componentIcon = document.createElement('span');
        componentIcon.textContent = '⚛️';
        header.appendChild(componentIcon);

        const componentName = document.createElement('span');
        componentName.textContent = componentData.name;
        header.appendChild(componentName);

        const componentType = document.createElement('span');
        componentType.style.cssText = `
      font-size: 11px;
      color: #6b7280;
      font-weight: 400;
      background: #f3f4f6;
      padding: 2px 6px;
      border-radius: 4px;
    `;
        componentType.textContent = componentData.type;
        header.appendChild(componentType);

        overlay.appendChild(header);

        // File path
        const filePath = document.createElement('div');
        filePath.style.cssText = `
      color: #6b7280;
      font-size: 12px;
      margin-bottom: 12px;
      word-break: break-all;
    `;
        filePath.textContent = `📁 ${componentData.filePath}:${componentData.lineNumber}:${componentData.columnNumber}`;
        overlay.appendChild(filePath);

        // Props section
        if (Object.keys(componentData.props).length > 0) {
            const propsSection = document.createElement('div');
            propsSection.style.cssText = `
        margin-bottom: 12px;
      `;

            const propsTitle = document.createElement('div');
            propsTitle.style.cssText = `
        font-weight: 500;
        color: #374151;
        margin-bottom: 4px;
        font-size: 13px;
      `;
            propsTitle.textContent = 'Props:';
            propsSection.appendChild(propsTitle);

            const propsList = document.createElement('div');
            propsList.style.cssText = `
        background: #f9fafb;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        max-height: 150px;
        overflow-y: auto;
      `;

            const propsText = Object.entries(componentData.props)
                .slice(0, 10) // Limit to 10 props
                .map(([key, value]) => {
                    const valueStr = typeof value === 'string' ? `"${value}"` : JSON.stringify(value);
                    return `${key}: ${valueStr}`;
                })
                .join('\n');

            propsList.textContent = propsText;
            propsSection.appendChild(propsList);
            overlay.appendChild(propsSection);
        }

        // Test IDs section
        const testIdsSection = document.createElement('div');
        testIdsSection.style.cssText = `
      margin-bottom: 12px;
    `;

        const testIdsTitle = document.createElement('div');
        testIdsTitle.style.cssText = `
      font-weight: 500;
      color: #374151;
      margin-bottom: 4px;
      font-size: 13px;
    `;
        testIdsTitle.textContent = 'Test IDs:';
        testIdsSection.appendChild(testIdsTitle);

        const testIdsList = document.createElement('div');
        testIdsList.style.cssText = `
      background: #f9fafb;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
      color: ${componentData.testIds.length > 0 ? '#059669' : '#dc2626'};
    `;
        testIdsList.textContent = componentData.testIds.length > 0
            ? componentData.testIds.join(', ')
            : 'No test IDs found';
        testIdsSection.appendChild(testIdsList);
        overlay.appendChild(testIdsSection);

        // Action buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = `
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-direction: column;
    `;

        // Primary buttons row
        const primaryRow = document.createElement('div');
        primaryRow.style.cssText = `
      display: flex;
      gap: 8px;
    `;

        // Open in Cursor button
        const openButton = document.createElement('button');
        openButton.textContent = '📝 Open in Cursor';
        openButton.style.cssText = `
      flex: 1;
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s;
    `;
        openButton.onmouseover = () => {
            openButton.style.background = '#2563eb';
        };
        openButton.onmouseout = () => {
            openButton.style.background = '#3b82f6';
        };
        openButton.onclick = () => this.handleOpenClick(componentData);
        primaryRow.appendChild(openButton);

        // Generate Test IDs button
        const generateButton = document.createElement('button');
        generateButton.textContent = '✨ Generate Test IDs';
        generateButton.style.cssText = `
      flex: 1;
      background: #10b981;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: background 0.2s;
    `;
        generateButton.onmouseover = () => {
            generateButton.style.background = '#059669';
        };
        generateButton.onmouseout = () => {
            generateButton.style.background = '#10b981';
        };
        generateButton.onclick = () => this.handleGenerateTestIds(componentData);
        primaryRow.appendChild(generateButton);

        buttonsContainer.appendChild(primaryRow);

        // Secondary buttons row
        const secondaryRow = document.createElement('div');
        secondaryRow.style.cssText = `
      display: flex;
      gap: 8px;
    `;

        // Show Tree View button
        if (this.onShowTreeView) {
            const treeButton = document.createElement('button');
            treeButton.textContent = '🌳 Component Tree';
            treeButton.style.cssText = `
        flex: 1;
        background: #8b5cf6;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: background 0.2s;
      `;
            treeButton.onmouseover = () => {
                treeButton.style.background = '#7c3aed';
            };
            treeButton.onmouseout = () => {
                treeButton.style.background = '#8b5cf6';
            };
            treeButton.onclick = () => {
                if (this.onShowTreeView) {
                    this.onShowTreeView();
                }
            };
            secondaryRow.appendChild(treeButton);
        }

        // Analyze Test IDs button
        if (this.onAnalyzeTestIds) {
            const analyzeButton = document.createElement('button');
            analyzeButton.textContent = '🔍 Analyze Test IDs';
            analyzeButton.style.cssText = `
        flex: 1;
        background: #f59e0b;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: background 0.2s;
      `;
            analyzeButton.onmouseover = () => {
                analyzeButton.style.background = '#d97706';
            };
            analyzeButton.onmouseout = () => {
                analyzeButton.style.background = '#f59e0b';
            };
            analyzeButton.onclick = () => {
                if (this.onAnalyzeTestIds) {
                    this.onAnalyzeTestIds();
                }
            };
            secondaryRow.appendChild(analyzeButton);
        }

        if (secondaryRow.children.length > 0) {
            buttonsContainer.appendChild(secondaryRow);
        }

        overlay.appendChild(buttonsContainer);

        // Close button
        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
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
        overlay.appendChild(closeButton);

        return overlay;
    }

    /**
     * Positions overlay near cursor, adjusting for screen boundaries
     */
    private positionOverlay(position: { x: number; y: number }): void {
        if (!this.overlayElement) return;

        const overlay = this.overlayElement;
        const rect = overlay.getBoundingClientRect();
        const padding = 10;

        let x = position.x + padding;
        let y = position.y + padding;

        // Adjust if overlay goes off right edge
        if (x + rect.width > window.innerWidth) {
            x = position.x - rect.width - padding;
        }

        // Adjust if overlay goes off bottom edge
        if (y + rect.height > window.innerHeight) {
            y = position.y - rect.height - padding;
        }

        // Ensure overlay stays on screen
        x = Math.max(padding, Math.min(x, window.innerWidth - rect.width - padding));
        y = Math.max(padding, Math.min(y, window.innerHeight - rect.height - padding));

        overlay.style.left = `${x}px`;
        overlay.style.top = `${y}px`;
    }

    /**
     * Handles "Open in Cursor" button click
     */
    private handleOpenClick(componentData: ComponentData): void {
        console.log('[Telescope] Opening component in Cursor:', componentData.name);

        this.client.send({
            type: 'open-editor',
            payload: {
                filePath: componentData.filePath,
                line: componentData.lineNumber,
                column: componentData.columnNumber,
                componentData,
            },
        }).then(() => {
            console.log('[Telescope] Open editor request sent');
            this.hide();
        }).catch(error => {
            console.error('[Telescope] Failed to open editor:', error);
            alert(`Failed to open editor: ${error.message}`);
        });
    }

    /**
     * Handles "Generate Test IDs" button click
     */
    private handleGenerateTestIds(componentData: ComponentData): void {
        console.log('[Telescope] Requesting test ID generation for:', componentData.name);

        this.client.send({
            type: 'generate-testids',
            payload: componentData,
        }).then((suggestions) => {
            console.log('[Telescope] Received test ID suggestions:', suggestions);
            // TODO: Display suggestions in a dialog for user approval
            alert(`Received ${suggestions?.length || 0} test ID suggestions. (UI for approval coming soon)`);
        }).catch(error => {
            console.error('[Telescope] Failed to generate test IDs:', error);
            alert(`Failed to generate test IDs: ${error.message}`);
        });
    }
}
