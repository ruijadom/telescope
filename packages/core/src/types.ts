/**
 * Core types for Telescope
 */

export interface ComponentData {
  /** Component display name */
  name: string;
  
  /** Absolute file path to component source */
  filePath: string;
  
  /** Line number where component is defined */
  lineNumber: number;
  
  /** Column number where component is defined */
  columnNumber: number;
  
  /** Component props and their values */
  props: Record<string, any>;
  
  /** Existing test IDs found on the component */
  testIds: string[];
  
  /** Component type (functional or class) */
  type: 'functional' | 'class';
  
  /** Unique identifier for this component instance */
  instanceId: string;
}

export interface EditorCommand {
  /** Command type */
  type: 'open' | 'insert' | 'analyze';
  
  /** Target file path */
  filePath: string;
  
  /** Line number for cursor positioning */
  line?: number;
  
  /** Column number for cursor positioning */
  column?: number;
  
  /** Code to insert (for insert commands) */
  code?: string;
  
  /** Component data for context */
  componentData?: ComponentData;
}

export interface TestIdSuggestion {
  /** Type of element (button, input, etc.) */
  elementType: string;
  
  /** Suggested test ID value */
  suggestedId: string;
  
  /** Explanation for this suggestion */
  reason: string;
  
  /** Line number where test ID should be inserted */
  insertionLine: number;
  
  /** Full attribute string to insert */
  attributeString: string;
}

export interface TelescopeConfig {
  /** Editor configuration */
  editor: {
    name: 'cursor' | 'vscode' | 'webstorm';
    command: string;
    args: string[];
  };
  
  /** Test ID pattern configuration */
  testId: {
    convention: 'data-testid' | 'data-test-id' | 'data-qa' | 'custom';
    customPattern?: string;
    autoGenerate: boolean;
  };
  
  /** AI configuration */
  ai: {
    enabled: boolean;
    provider: 'cursor-native' | 'openai' | 'anthropic';
    model?: string;
    apiKey?: string;
  };
  
  /** Project structure */
  project: {
    roots: string[];
    extensions: string[];
    exclude: string[];
  };
  
  /** Server configuration */
  server: {
    port: number;
    host: string;
  };
}

export interface WebSocketMessage {
  /** Message type */
  type: 'component-selected' | 'open-editor' | 'generate-testids' | 'insert-code' | 'error';
  
  /** Message payload */
  payload: any;
  
  /** Request ID for tracking */
  requestId: string;
  
  /** Timestamp */
  timestamp: number;
}

export interface ComponentTreeNode {
  /** Component data */
  component: ComponentData;
  
  /** Child components */
  children: ComponentTreeNode[];
  
  /** Parent component (null for root) */
  parent: ComponentTreeNode | null;
  
  /** Depth in tree (0 for root) */
  depth: number;
  
  /** Whether this node is expanded in UI */
  isExpanded: boolean;
}

export interface MissingTestIdInfo {
  /** Component data */
  component: ComponentData;
  
  /** DOM element missing test ID (browser-only) */
  element: any;
  
  /** Type of interactive element */
  elementType: string;
  
  /** Element's role or purpose */
  elementRole?: string;
  
  /** Element's text content (if any) */
  elementText?: string;
}

export interface TestIdAnalysisResult {
  /** Total number of interactive elements found */
  totalInteractive: number;
  
  /** Number of elements with test IDs */
  withTestIds: number;
  
  /** Number of elements without test IDs */
  withoutTestIds: number;
  
  /** List of components/elements missing test IDs */
  missingTestIds: MissingTestIdInfo[];
  
  /** Coverage percentage */
  coveragePercentage: number;
}
