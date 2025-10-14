import React from 'react';
import { ChartLine } from 'lucide-react';
import { ServiceNowQueryBuilder, type QueryMode } from './ServiceNowQueryBuilder';
import { DataPreview } from './DataPreview';
import {
  QueryTranslationPreview,
  QueryTranslationError,
  type QueryTranslation,
} from './QueryTranslationPreview';
import { ChartRenderer } from './ChartRenderer';
import type { DataSource, QueryConfig } from '../types/servicenow';
import type { Message } from './ChatPanel';

interface VisualizationPanelProps {
  dataSource: DataSource;
  messages: Message[];
  queryMode: QueryMode;
  queryResults: { data: Record<string, any>[]; tableName: string } | null;
  translationResult: QueryTranslation | null;
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
  onAnalyze: () => void;
}

export function VisualizationPanel({
  dataSource,
  messages,
  queryMode,
  queryResults,
  translationResult,
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
  onAnalyze,
}: VisualizationPanelProps) {
  return (
    <div className="visualization-panel">
      {dataSource === 'query' ? (
        <>
          {/* Query Builder and Data Preview */}
          <div className="query-section">
            <ServiceNowQueryBuilder
              onExecuteQuery={onExecuteQuery}
              onNaturalLanguageQuery={onNaturalLanguageQuery}
              isLoading={isQueryLoading || isTranslating}
              mode={queryMode}
              onModeChange={onModeChange}
            />

            {/* Show translation preview if in simple mode and translation succeeded */}
            {queryMode === 'simple' && translationResult && (
              <QueryTranslationPreview
                translation={translationResult}
                onConfirm={onConfirmTranslation}
                onEdit={onEditTranslation}
                isLoading={isQueryLoading}
              />
            )}

            {/* Show translation error if translation failed */}
            {queryMode === 'simple' && translationError && (
              <QueryTranslationError
                error={translationError}
                onRetry={onRetryTranslation}
                onSwitchToAdvanced={() => onModeChange('advanced')}
              />
            )}

            {/* Show data preview after query executes */}
            {queryResults && (
              <DataPreview
                data={queryResults.data}
                tableName={queryResults.tableName}
                onAnalyze={onAnalyze}
                isAnalyzing={isAnalyzing}
              />
            )}
          </div>

          {/* Show charts if any exist */}
          {messages.some((m) => m.chartData) && (
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
      ) : messages.some((m) => m.chartData) ? (
        <>
          <div className="visualization-header">
            <h2>Analysis & Visualizations</h2>
          </div>
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
        </>
      ) : (
        <div className="visualization-empty">
          <ChartLine size={48} className="empty-icon" />
          <h2>Analysis & Visualizations</h2>
          <p>Charts and detailed analysis will appear here as you chat</p>
        </div>
      )}
    </div>
  );
}
