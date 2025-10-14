import axios from 'axios';
import type { QueryConfig, TableAPIResponse } from '../types/servicenow';
import type { QueryTranslation, QueryClarification } from '../components/QueryTranslationPreview';
import type { ChartData } from '../types/chart';

/**
 * Message interface for Claude API
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * File upload data structure
 */
export interface FileUpload {
  base64: string;
  fileName: string;
  mediaType: string;
  isText: boolean;
}

/**
 * Response from Claude analyze endpoint
 */
export interface AnalyzeResponse {
  content: string;
  chartData?: ChartData;
  hasToolUse: boolean;
}

/**
 * Unwrap ServiceNow API response that may be wrapped in a "result" object
 */
function unwrapServiceNowResponse<T>(data: any): T {
  return data.result || data;
}

/**
 * Translate natural language query to structured ServiceNow query
 * Can return either a translation or a clarification request
 */
export async function translateNaturalLanguageQuery(
  query: string,
  schema: string,
  tableHint?: string
): Promise<QueryTranslation | QueryClarification> {
  const response = await axios.post('/api/x_ipnll_data_ana_0/claude_ai/query_translate', {
    naturalLanguage: query,
    tableHint: tableHint,
    schema: schema,
  });

  return unwrapServiceNowResponse<QueryTranslation | QueryClarification>(response.data);
}

/**
 * Execute a ServiceNow Table API query
 */
export async function executeTableQuery(config: QueryConfig): Promise<Record<string, any>[]> {
  const params: Record<string, any> = {
    sysparm_limit: config.limit,
  };

  if (config.query) {
    params.sysparm_query = config.query;
  }

  if (config.fields) {
    params.sysparm_fields = config.fields;
  }

  if (config.displayValue) {
    params.sysparm_display_value = config.displayValue;
  }

  if (config.offset) {
    params.sysparm_offset = config.offset;
  }

  const response = await axios.get<TableAPIResponse | any>(
    `/api/now/table/${config.table}`,
    { params }
  );

  // ServiceNow may wrap the response in a "result" object
  const result: any = unwrapServiceNowResponse(response.data);
  const records = Array.isArray(result) ? result : result?.result || [];

  return records;
}

/**
 * Analyze data with Claude AI
 */
export async function analyzeDataWithClaude(
  messages: Message[],
  fileData: FileUpload | null
): Promise<AnalyzeResponse> {
  const response = await axios.post('/api/x_ipnll_data_ana_0/claude_ai/analyze', {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    fileData: fileData,
  });

  const result = unwrapServiceNowResponse<any>(response.data);

  return {
    content: result.content || 'No response from AI',
    chartData: result.chartData,
    hasToolUse: result.hasToolUse || !!result.chartData,
  };
}

/**
 * Convert query results to file upload format for Claude analysis
 */
export function convertQueryResultsToFileUpload(
  data: Record<string, any>[],
  tableName: string
): FileUpload {
  const queryDataString = JSON.stringify(data, null, 2);
  const base64Data = btoa(encodeURIComponent(queryDataString));

  return {
    base64: base64Data,
    fileName: `${tableName}_query_results.json`,
    mediaType: 'application/json',
    isText: true,
  };
}
