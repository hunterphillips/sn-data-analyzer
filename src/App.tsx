import React, { useState, useRef, useEffect } from 'react';
import { ChatPanel, type Message } from './components/ChatPanel';
import { VisualizationPanel } from './components/VisualizationPanel';
import { type QueryMode } from './components/ServiceNowQueryBuilder';
import { type QueryTranslation, type QueryClarification } from './components/QueryTranslationPreview';
import { formatSchemaForPrompt } from './data/serviceNowSchemas';
import {
  translateNaturalLanguageQuery,
  executeTableQuery,
  analyzeDataWithClaude,
  convertQueryResultsToFileUpload,
  type FileUpload,
} from './services/serviceNowApi';
import type { DataSource, QueryConfig } from './types/servicenow';
import './App.css';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUpload, setCurrentUpload] = useState<FileUpload | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('query');
  const [queryResults, setQueryResults] = useState<{
    data: Record<string, any>[];
    tableName: string;
  } | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // Query translation state
  const [queryMode, setQueryMode] = useState<QueryMode>('simple');
  const [translationResult, setTranslationResult] = useState<QueryTranslation | null>(null);
  const [clarificationResult, setClarificationResult] = useState<QueryClarification | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const base64Data = btoa(encodeURIComponent(text));

      setCurrentUpload({
        base64: base64Data,
        fileName: file.name,
        mediaType: 'text/plain',
        isText: true,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Failed to read file');
    }
  };

  const handleNaturalLanguageQuery = async (query: string, tableHint?: string) => {
    setIsTranslating(true);
    setTranslationError(null);
    setTranslationResult(null);
    setClarificationResult(null);

    try {
      const schema = tableHint
        ? formatSchemaForPrompt(tableHint)
        : formatSchemaForPrompt();

      const result = await translateNaturalLanguageQuery(query, schema, tableHint);

      // Check if result is a clarification request
      if ('needsClarification' in result && result.needsClarification) {
        setClarificationResult(result as QueryClarification);
      } else {
        setTranslationResult(result as QueryTranslation);
      }
    } catch (error: any) {
      console.error('Translation error:', error);

      // Extract error message from response
      let errorMsg = 'Failed to translate query';
      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        // Check if error is an object with message/detail or a string
        if (typeof apiError === 'object') {
          errorMsg = apiError.message || apiError.detail || JSON.stringify(apiError);
        } else {
          errorMsg = String(apiError);
        }
      } else if (error.message) {
        errorMsg = error.message;
      }

      setTranslationError(errorMsg);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExecuteQuery = async (config: QueryConfig) => {
    setIsQueryLoading(true);
    setQueryResults(null);
    setTranslationResult(null);

    try {
      const records = await executeTableQuery(config);
      setQueryResults({
        data: records,
        tableName: config.table,
      });
    } catch (error) {
      console.error('Query execution error:', error);
      alert('Failed to execute query. Check console for details.');
    } finally {
      setIsQueryLoading(false);
    }
  };

  const handleConfirmTranslation = async () => {
    if (!translationResult) return;

    // Convert translation to QueryConfig and execute
    const config: QueryConfig = {
      table: translationResult.table,
      query: translationResult.encodedQuery,
      fields: translationResult.fields.join(','),
      limit: translationResult.limit,
      offset: 0,
      displayValue: translationResult.displayValue || 'true',
    };

    await handleExecuteQuery(config);
  };

  const handleEditTranslation = () => {
    // Switch to advanced mode to let user edit manually
    setQueryMode('advanced');
    setTranslationResult(null);
    setTranslationError(null);
  };

  const handleRetryTranslation = () => {
    // Clear error to allow user to try again
    setTranslationError(null);
  };

  const handleRefineClarification = () => {
    // Clear clarification to allow user to refine query
    setClarificationResult(null);
  };

  const handleUseDefaultClarification = () => {
    // If there's a suggestion, we could add it to the query builder
    // For now, just clear clarification and let user proceed
    setClarificationResult(null);
    // Optionally trigger a retry with modified query
  };

  const handleAnalyzeQueryResults = async () => {
    if (!queryResults || !input.trim()) {
      alert('Please enter a question about the data');
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const queryDataUpload = convertQueryResultsToFileUpload(
        queryResults.data,
        queryResults.tableName
      );

      const result = await analyzeDataWithClaude(
        [...messages, userMessage],
        queryDataUpload
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.content,
        chartData: result.chartData,
        hasToolUse: result.hasToolUse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If we're in query mode and have results, analyze them
    if (dataSource === 'query' && queryResults) {
      await handleAnalyzeQueryResults();
      return;
    }

    // Otherwise, handle file upload mode
    if (!input.trim() && !currentUpload) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await analyzeDataWithClaude(
        [...messages, userMessage],
        currentUpload
      );

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.content,
        chartData: result.chartData,
        hasToolUse: result.hasToolUse,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentUpload(null);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataSourceChange = (source: DataSource) => {
    setDataSource(source);
    if (source === 'file') {
      setQueryResults(null);
    } else {
      setCurrentUpload(null);
    }
  };

  return (
    <div className="app-container">
      <ChatPanel
        messages={messages}
        input={input}
        isLoading={isLoading}
        currentUpload={currentUpload}
        dataSource={dataSource}
        hasQueryResults={!!queryResults}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onFileSelect={handleFileSelect}
        onDataSourceChange={handleDataSourceChange}
        onClearUpload={() => setCurrentUpload(null)}
        fileInputRef={fileInputRef}
        messagesEndRef={messagesEndRef}
      />
      <VisualizationPanel
        dataSource={dataSource}
        messages={messages}
        queryMode={queryMode}
        queryResults={queryResults}
        translationResult={translationResult}
        clarificationResult={clarificationResult}
        translationError={translationError}
        isQueryLoading={isQueryLoading}
        isTranslating={isTranslating}
        isAnalyzing={isLoading}
        onExecuteQuery={handleExecuteQuery}
        onNaturalLanguageQuery={handleNaturalLanguageQuery}
        onModeChange={setQueryMode}
        onConfirmTranslation={handleConfirmTranslation}
        onEditTranslation={handleEditTranslation}
        onRetryTranslation={handleRetryTranslation}
        onRefineClarification={handleRefineClarification}
        onUseDefaultClarification={handleUseDefaultClarification}
        onAnalyze={handleAnalyzeQueryResults}
      />
    </div>
  );
}

export default App;
