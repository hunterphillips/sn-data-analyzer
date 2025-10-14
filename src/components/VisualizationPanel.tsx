import React from 'react';
import { ChartLine } from 'lucide-react';
import { DataPreview } from './DataPreview';
import { ChartRenderer } from './ChartRenderer';
import type { DataSource, QueryConfig } from '../types/servicenow';
import type { Message } from './ChatPanel';
import type { QueryMode } from './ServiceNowQueryBuilder';
import type { QueryTranslation, QueryClarification } from './QueryTranslationPreview';

interface VisualizationPanelProps {
  dataSource: DataSource;
  messages: Message[];
  queryMode: QueryMode;
  queryResults: { data: Record<string, any>[]; tableName: string } | null;
  translationResult: QueryTranslation | null;
  clarificationResult: QueryClarification | null;
  translationError: string | null;
  isQueryLoading: boolean;
  isTranslating: boolean;
  isAnalyzing: boolean;
  onExecuteQuery: (config: QueryConfig) => void;
  onNaturalLanguageQuery: (query: string, tableHint?: string) => void;
  onModeChange: (mode: QueryMode) => void;
  onConfirmTranslation: () => void;
  onEditTranslation: () => void;
  onRetryTranslation: () => void;
  onRefineClarification: () => void;
  onUseDefaultClarification: () => void;
  onAnalyze: () => void;
}

export function VisualizationPanel({
  dataSource,
  messages,
  queryMode,
  queryResults,
  translationResult,
  clarificationResult,
  translationError,
  isQueryLoading,
  isTranslating,
  isAnalyzing,
  onExecuteQuery,
  onNaturalLanguageQuery,
  onModeChange,
  onConfirmTranslation,
  onEditTranslation,
  onRetryTranslation,
  onRefineClarification,
  onUseDefaultClarification,
  onAnalyze,
}: VisualizationPanelProps) {
  const hasCharts = messages.some((m) => m.chartData);
  const hasData = queryResults && queryResults.data.length > 0;
  const hasContent = hasCharts || hasData;

  return (
    <div className="visualization-panel">
      {hasContent ? (
        <>
          <div className="visualization-header">
            <h2>Analysis & Visualizations</h2>
          </div>

          {/* Show data preview when query results exist */}
          {hasData && (
            <DataPreview
              data={queryResults.data}
              tableName={queryResults.tableName}
              onAnalyze={onAnalyze}
              isAnalyzing={isAnalyzing}
            />
          )}

          {/* Show charts when messages have chart data */}
          {hasCharts && (
            <div className="charts-container">
              {messages.map(
                (message, index) =>
                  message.chartData && (
                    <div key={`chart-${index}`} className="chart-wrapper">
                      <ChartRenderer data={message.chartData} />
                    </div>
                  )
              )}
            </div>
          )}
        </>
      ) : (
        <div className="visualization-empty">
          <ChartLine size={48} className="empty-icon" />
          <h2>Analysis & Visualizations</h2>
          <p>
            {dataSource === 'query'
              ? 'Pull data using the form on the left to get started'
              : 'Upload a file and ask questions to see visualizations'}
          </p>
        </div>
      )}
    </div>
  );
}
