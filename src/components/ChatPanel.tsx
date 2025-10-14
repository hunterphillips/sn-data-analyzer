import React from 'react';
import { Send, Paperclip, ChartLine, Database, Upload } from 'lucide-react';
import type { DataSource, QueryConfig } from '../types/servicenow';
import type { FileUpload } from '../services/serviceNowApi';
import {
  ServiceNowQueryBuilder,
  type QueryMode,
} from './ServiceNowQueryBuilder';
import {
  QueryTranslationPreview,
  QueryTranslationError,
  QueryClarificationRequest,
  type QueryTranslation,
  type QueryClarification,
} from './QueryTranslationPreview';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chartData?: any;
  hasToolUse?: boolean;
}

interface ChatPanelProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  currentUpload: FileUpload | null;
  dataSource: DataSource;
  hasQueryResults: boolean;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDataSourceChange: (source: DataSource) => void;
  onClearUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  // Query builder props
  queryMode: QueryMode;
  onModeChange: (mode: QueryMode) => void;
  onExecuteQuery: (config: QueryConfig) => void;
  onNaturalLanguageQuery: (query: string, tableHint?: string) => void;
  isQueryLoading: boolean;
  isTranslating: boolean;
  translationResult: QueryTranslation | null;
  clarificationResult: QueryClarification | null;
  translationError: string | null;
  onConfirmTranslation: () => void;
  onEditTranslation: () => void;
  onRetryTranslation: () => void;
  onRefineClarification: () => void;
  onUseDefaultClarification: () => void;
  reportQuestion: string;
  onReportQuestionChange: (question: string) => void;
}

export function ChatPanel({
  messages,
  input,
  isLoading,
  currentUpload,
  dataSource,
  hasQueryResults,
  onInputChange,
  onSubmit,
  onFileSelect,
  onDataSourceChange,
  onClearUpload,
  fileInputRef,
  messagesEndRef,
  queryMode,
  onModeChange,
  onExecuteQuery,
  onNaturalLanguageQuery,
  isQueryLoading,
  isTranslating,
  translationResult,
  clarificationResult,
  translationError,
  onConfirmTranslation,
  onEditTranslation,
  onRetryTranslation,
  onRefineClarification,
  onUseDefaultClarification,
  reportQuestion,
  onReportQuestionChange,
}: ChatPanelProps) {
  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>ServiceNow Data Analyst</h2>
        {/* <p className="powered-by">Powered by Claude</p> */}

        {/* Data Source Toggle */}
        <div className="data-source-toggle">
          <button
            type="button"
            className={`toggle-btn ${dataSource === 'query' ? 'active' : ''}`}
            onClick={() => onDataSourceChange('query')}
          >
            <Database size={16} />
            Data Lookup
          </button>
          <button
            type="button"
            className={`toggle-btn ${dataSource === 'file' ? 'active' : ''}`}
            onClick={() => onDataSourceChange('file')}
          >
            <Upload size={16} />
            Upload File
          </button>
        </div>
      </div>

      {dataSource === 'query' ? (
        /* Query Mode - Show Query Builder + Chat Input */
        <>
          <div className="query-builder-section">
            <ServiceNowQueryBuilder
              onExecuteQuery={onExecuteQuery}
              onNaturalLanguageQuery={onNaturalLanguageQuery}
              isLoading={isQueryLoading || isTranslating}
              mode={queryMode}
              onModeChange={onModeChange}
              translationResult={translationResult}
              reportQuestion={reportQuestion}
              onReportQuestionChange={onReportQuestionChange}
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

            {/* Show clarification request if translation needs more info */}
            {queryMode === 'simple' && clarificationResult && (
              <QueryClarificationRequest
                clarification={clarificationResult}
                onRefine={onRefineClarification}
                onUseDefault={
                  clarificationResult.suggestion
                    ? onUseDefaultClarification
                    : undefined
                }
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
          </div>

          {/* Chat Input for Query Mode */}
          <form onSubmit={onSubmit} className="input-form">
            <div className="input-row">
              <input
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={
                  hasQueryResults
                    ? 'Ask about this data...'
                    : 'Get data above to analyze...'
                }
                disabled={!hasQueryResults || isLoading}
              />
              <button
                type="submit"
                disabled={!hasQueryResults || isLoading || !input.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </>
      ) : (
        /* File Mode - Show Chat Interface */
        <>
          <div className="messages">
            {messages.length === 0 ? (
              <div className="welcome">
                <p>
                  Upload your exported data file (CSV, JSON, PDF) and ask
                  questions to generate insights and visualizations.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`message ${message.role}`}>
                  {message.hasToolUse && message.role === 'assistant' && (
                    <div className="chart-badge">
                      <ChartLine size={14} /> Generated Chart
                    </div>
                  )}
                  <div className="message-content">{message.content}</div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message assistant">
                <div className="message-content loading">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input for File Mode */}
          <form onSubmit={onSubmit} className="input-form">
            {currentUpload && (
              <div className="file-preview">
                <span>{currentUpload.fileName}</span>
                <button type="button" onClick={onClearUpload}>
                  ×
                </button>
              </div>
            )}
            <div className="input-row">
              <button
                type="button"
                className="attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Paperclip size={20} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Ask about your ServiceNow data..."
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !currentUpload)}
              >
                <Send size={20} />
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv,.txt,.pdf"
              onChange={onFileSelect}
              style={{ display: 'none' }}
            />
          </form>
        </>
      )}
    </div>
  );
}
