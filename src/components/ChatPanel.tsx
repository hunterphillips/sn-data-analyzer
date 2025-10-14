import React from 'react';
import { Send, Paperclip, ChartLine, Database, Upload } from 'lucide-react';
import type { DataSource } from '../types/servicenow';
import type { FileUpload } from '../services/serviceNowApi';

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
            className={`toggle-btn ${dataSource === 'file' ? 'active' : ''}`}
            onClick={() => onDataSourceChange('file')}
          >
            <Upload size={16} />
            Upload File
          </button>
          <button
            type="button"
            className={`toggle-btn ${dataSource === 'query' ? 'active' : ''}`}
            onClick={() => onDataSourceChange('query')}
          >
            <Database size={16} />
            Data Lookup
          </button>
        </div>
      </div>

      <div className="messages">
        {messages.length === 0 ? (
          <div className="welcome">
            <p>
              {dataSource === 'file'
                ? 'Upload your exported data file (CSV, JSON, PDF) and ask questions to generate insights and visualizations.'
                : 'Browse your ServiceNow tables, pull data, and get AI-powered insights.'}
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

      {dataSource === 'file' ? (
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
      ) : (
        <div className="query-input-section">
          {hasQueryResults ? (
            <form onSubmit={onSubmit} className="input-form">
              <div className="input-row">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Ask Claude about this data..."
                  disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !input.trim()}>
                  <Send size={20} />
                </button>
              </div>
            </form>
          ) : (
            <div className="query-prompt">
              <p>
                Select a table and pull data from the panel on the right to
                get started
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
