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
  const [isDataPreviewExpanded, setIsDataPreviewExpanded] = useState(true);
  const [reportQuestion, setReportQuestion] = useState('');

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

  // Type guard to check if result is a clarification
  const isClarification = (result: QueryTranslation | QueryClarification): result is QueryClarification => {
    return 'needsClarification' in result && result.needsClarification === true;
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

      // Check if result is a clarification request using type guard
      if (isClarification(result)) {
        setClarificationResult(result);
      } else {
        setTranslationResult(result);

        // Automatically execute the query after successful translation
        const config: QueryConfig = {
          table: result.table,
          query: result.encodedQuery,
          limit: result.limit,
          offset: 0,
          displayValue: result.displayValue || 'true',
        };

        // Execute the query (don't await to avoid blocking)
        handleExecuteQuery(config);
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

      // Auto-submit report question if it exists
      if (reportQuestion.trim()) {
        // Wait a bit for queryResults state to update
        setTimeout(() => {
          handleAnalyzeQueryResults(reportQuestion);
          setReportQuestion(''); // Clear the question after submitting
        }, 100);
      }
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

  const handleToggleDataPreview = () => {
    setIsDataPreviewExpanded((prev) => !prev);
  };

  const handleAnalyzeQueryResults = async (question?: string) => {
    const questionText = question || input;

    if (!queryResults || !questionText.trim()) {
      if (!question) {
        alert('Please enter a question about the data');
      }
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: questionText,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!question) {
      setInput('');
    }
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

      // Auto-collapse data preview when a chart is generated
      if (result.chartData) {
        setIsDataPreviewExpanded(false);
      }
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

      // Auto-collapse data preview when a chart is generated (if in query mode)
      if (result.chartData && dataSource === 'query') {
        setIsDataPreviewExpanded(false);
      }
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
    // Don't clear data when switching modes - preserve both file uploads and query results
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
        queryMode={queryMode}
        onModeChange={setQueryMode}
        onExecuteQuery={handleExecuteQuery}
        onNaturalLanguageQuery={handleNaturalLanguageQuery}
        isQueryLoading={isQueryLoading}
        isTranslating={isTranslating}
        translationResult={translationResult}
        clarificationResult={clarificationResult}
        translationError={translationError}
        onConfirmTranslation={handleConfirmTranslation}
        onEditTranslation={handleEditTranslation}
        onRetryTranslation={handleRetryTranslation}
        onRefineClarification={handleRefineClarification}
        onUseDefaultClarification={handleUseDefaultClarification}
        reportQuestion={reportQuestion}
        onReportQuestionChange={setReportQuestion}
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
        isDataPreviewExpanded={isDataPreviewExpanded}
        onToggleDataPreview={handleToggleDataPreview}
      />
    </div>
  );
}

export default App;
