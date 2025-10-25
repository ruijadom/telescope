/**
 * AnalysisPanel - UI panel for displaying test ID analysis results
 */

import type { TestIdAnalysisResult, MissingTestIdInfo } from '@ruijadom/telescope-core';
import type { TelescopeClient } from './client';

export class AnalysisPanel {
  private panelElement: HTMLElement | null = null;
  private client: TelescopeClient;

  constructor(client: TelescopeClient) {
    this.client = client;
  }

  /**
   * Shows analysis panel with test ID analysis results
   */
  show(analysisResult: TestIdAnalysisResult): void {
    // Remove existing panel if present
    this.hide();

    // Create and render panel
    this.panelElement = this.render(analysisResult);
    document.body.appendChild(this.panelElement);
  }

  /**
   * Hides and removes panel from DOM
   */
  hide(): void {
    if (this.panelElement) {
      this.panelElement.remove();
      this.panelElement = null;
    }
  }

  /**
   * Renders analysis panel HTML
   */
  private render(analysisResult: TestIdAnalysisResult): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'hubble-analysis-panel';
    panel.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 999999;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      width: 600px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      font-weight: 600;
      font-size: 18px;
      color: #1f2937;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    `;
    header.innerHTML = `
      <span>🔍</span>
      <span>Test ID Analysis</span>
    `;
    panel.appendChild(header);

    // Statistics summary
    const statsSection = this.renderStatistics(analysisResult);
    panel.appendChild(statsSection);

    // Missing test IDs list
    if (analysisResult.missingTestIds.length > 0) {
      const listSection = this.renderMissingTestIdsList(analysisResult.missingTestIds);
      panel.appendChild(listSection);
    } else {
      const emptyState = document.createElement('div');
      emptyState.style.cssText = `
        text-align: center;
        padding: 32px;
        color: #059669;
        font-size: 16px;
      `;
      emptyState.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
        <div style="font-weight: 600;">All interactive elements have test IDs!</div>
        <div style="font-size: 13px; color: #6b7280; margin-top: 8px;">Great job maintaining test coverage.</div>
      `;
      panel.appendChild(emptyState);
    }

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 12px;
      right: 12px;
      background: transparent;
      border: none;
      font-size: 28px;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
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
    panel.appendChild(closeButton);

    return panel;
  }

  /**
   * Renders statistics summary section
   */
  private renderStatistics(analysisResult: TestIdAnalysisResult): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      background: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    `;

    const statsGrid = document.createElement('div');
    statsGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    `;

    // Total interactive elements
    const totalStat = this.createStatCard(
      '📊',
      analysisResult.totalInteractive.toString(),
      'Total Interactive',
      '#6b7280'
    );
    statsGrid.appendChild(totalStat);

    // With test IDs
    const withStat = this.createStatCard(
      '✅',
      analysisResult.withTestIds.toString(),
      'With Test IDs',
      '#059669'
    );
    statsGrid.appendChild(withStat);

    // Without test IDs
    const withoutStat = this.createStatCard(
      '❌',
      analysisResult.withoutTestIds.toString(),
      'Missing Test IDs',
      '#dc2626'
    );
    statsGrid.appendChild(withoutStat);

    section.appendChild(statsGrid);

    // Coverage bar
    const coverageBar = document.createElement('div');
    coverageBar.style.cssText = `
      margin-top: 16px;
    `;

    const coverageLabel = document.createElement('div');
    coverageLabel.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
      color: #374151;
      font-weight: 500;
    `;
    coverageLabel.innerHTML = `
      <span>Test ID Coverage</span>
      <span>${analysisResult.coveragePercentage}%</span>
    `;
    coverageBar.appendChild(coverageLabel);

    const progressTrack = document.createElement('div');
    progressTrack.style.cssText = `
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    `;

    const progressFill = document.createElement('div');
    progressFill.style.cssText = `
      height: 100%;
      width: ${analysisResult.coveragePercentage}%;
      background: ${this.getCoverageColor(analysisResult.coveragePercentage)};
      transition: width 0.3s ease;
    `;
    progressTrack.appendChild(progressFill);
    coverageBar.appendChild(progressTrack);

    section.appendChild(coverageBar);

    return section;
  }

  /**
   * Creates a stat card element
   */
  private createStatCard(icon: string, value: string, label: string, color: string): HTMLElement {
    const card = document.createElement('div');
    card.style.cssText = `
      text-align: center;
    `;

    card.innerHTML = `
      <div style="font-size: 24px; margin-bottom: 4px;">${icon}</div>
      <div style="font-size: 24px; font-weight: 700; color: ${color}; margin-bottom: 4px;">${value}</div>
      <div style="font-size: 12px; color: #6b7280;">${label}</div>
    `;

    return card;
  }

  /**
   * Gets color based on coverage percentage
   */
  private getCoverageColor(percentage: number): string {
    if (percentage >= 80) return '#059669'; // Green
    if (percentage >= 50) return '#f59e0b'; // Orange
    return '#dc2626'; // Red
  }

  /**
   * Renders list of components missing test IDs
   */
  private renderMissingTestIdsList(missingTestIds: MissingTestIdInfo[]): HTMLElement {
    const section = document.createElement('div');
    section.style.cssText = `
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-weight: 600;
      font-size: 15px;
      color: #374151;
      margin-bottom: 12px;
    `;
    title.textContent = `Missing Test IDs (${missingTestIds.length})`;
    section.appendChild(title);

    const listContainer = document.createElement('div');
    listContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      background: white;
    `;

    missingTestIds.forEach((info) => {
      const item = this.renderMissingTestIdItem(info);
      listContainer.appendChild(item);
    });

    section.appendChild(listContainer);

    return section;
  }

  /**
   * Renders a single missing test ID item
   */
  private renderMissingTestIdItem(info: MissingTestIdInfo): HTMLElement {
    const item = document.createElement('div');
    item.style.cssText = `
      padding: 12px 16px;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background 0.2s;
    `;
    item.onmouseover = () => {
      item.style.background = '#f9fafb';
    };
    item.onmouseout = () => {
      item.style.background = 'white';
    };
    item.onclick = () => this.handleNavigateToComponent(info);

    // Element type and text
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    `;

    const elementType = document.createElement('span');
    elementType.style.cssText = `
      font-weight: 600;
      color: #1f2937;
      font-size: 13px;
    `;
    elementType.textContent = info.elementType;
    header.appendChild(elementType);

    if (info.elementText) {
      const elementText = document.createElement('span');
      elementText.style.cssText = `
        color: #6b7280;
        font-size: 12px;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      `;
      elementText.textContent = `"${info.elementText}"`;
      header.appendChild(elementText);
    }

    item.appendChild(header);

    // Component info
    const componentInfo = document.createElement('div');
    componentInfo.style.cssText = `
      font-size: 12px;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 4px;
    `;
    componentInfo.innerHTML = `
      <span>⚛️</span>
      <span>${info.component.name}</span>
    `;
    item.appendChild(componentInfo);

    // File path (if available)
    if (info.component.filePath !== 'unknown') {
      const filePath = document.createElement('div');
      filePath.style.cssText = `
        font-size: 11px;
        color: #9ca3af;
        margin-top: 2px;
      `;
      filePath.textContent = `${info.component.filePath}:${info.component.lineNumber}`;
      item.appendChild(filePath);
    }

    return item;
  }

  /**
   * Handles navigation to a component from the list
   */
  private handleNavigateToComponent(info: MissingTestIdInfo): void {
    console.log('[Telescope] Navigating to component:', info.component.name);

    // Highlight the element in the page
    this.highlightElement(info.element);

    // If component has valid file path, offer to open in editor
    if (info.component.filePath !== 'unknown') {
      this.client.send({
        type: 'open-editor',
        payload: {
          filePath: info.component.filePath,
          line: info.component.lineNumber,
          column: info.component.columnNumber,
          componentData: info.component,
        },
      }).then(() => {
        console.log('[Telescope] Open editor request sent');
      }).catch(error => {
        console.error('[Telescope] Failed to open editor:', error);
      });
    }
  }

  /**
   * Highlights an element temporarily
   */
  private highlightElement(element: HTMLElement): void {
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add highlight overlay
    const rect = element.getBoundingClientRect();
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 3px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      pointer-events: none;
      z-index: 999998;
      border-radius: 4px;
      animation: hubble-pulse 1s ease-in-out;
    `;

    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes hubble-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.02); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(highlight);

    // Remove highlight after animation
    setTimeout(() => {
      highlight.remove();
      style.remove();
    }, 2000);
  }
}
