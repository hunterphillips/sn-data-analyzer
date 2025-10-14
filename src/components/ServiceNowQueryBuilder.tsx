import React, { useState, useEffect } from 'react';
import type { QueryConfig, ServiceNowTable } from '../types/servicenow';
import type { QueryTranslation } from './QueryTranslationPreview';

export type QueryMode = 'simple' | 'advanced';

interface ServiceNowQueryBuilderProps {
  onExecuteQuery: (config: QueryConfig) => void;
  onNaturalLanguageQuery: (query: string, tableHint?: string) => void;
  isLoading?: boolean;
  mode: QueryMode;
  onModeChange: (mode: QueryMode) => void;
  translationResult: QueryTranslation | null;
  reportQuestion: string;
  onReportQuestionChange: (question: string) => void;
}

const COMMON_TABLES = [
  { value: 'incident', label: 'Incident' },
  { value: 'change_request', label: 'Change Request' },
  { value: 'problem', label: 'Problem' },
  { value: 'task', label: 'Task' },
  { value: 'cmdb_ci', label: 'Configuration Item' },
  { value: 'cmdb_ci_server', label: 'Server' },
  { value: 'cmdb_ci_computer', label: 'Computer' },
  // { value: 'sys_user', label: 'User' },
  // { value: 'sys_user_group', label: 'User Group' },
];

export function ServiceNowQueryBuilder({
  onExecuteQuery,
  onNaturalLanguageQuery,
  isLoading = false,
  mode,
  onModeChange,
  translationResult,
  reportQuestion,
  onReportQuestionChange,
}: ServiceNowQueryBuilderProps) {
  const [config, setConfig] = useState<QueryConfig>({
    table: 'incident',
    query: '',
    limit: 100,
    offset: 0,
    displayValue: 'true',
  });

  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');

  // Auto-fill Advanced mode form when switching from Simple mode with a translation
  useEffect(() => {
    if (mode === 'advanced' && translationResult) {
      setConfig({
        table: translationResult.table,
        query: translationResult.encodedQuery,
        limit: translationResult.limit,
        offset: 0,
        displayValue: 'true', // Always use display values (human-readable)
      });
    }
  }, [mode, translationResult]);

  const handleAdvancedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteQuery(config);
  };

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalLanguageQuery.trim()) return;
    onNaturalLanguageQuery(naturalLanguageQuery);
  };

  const handleTemplateLoad = (template: Partial<QueryConfig>) => {
    setConfig((prev) => ({ ...prev, ...template }));
  };

  return (
    <div className="query-builder">
      <div className="query-builder-header">
        <div className="header-top">
          <div>
            <h3>Define your data</h3>
            {/* <p className="query-builder-description">
              {mode === 'simple'
                ? 'Describe the data you want to see'
                : 'Build a custom query with filters and field selection'}
            </p> */}
          </div>

          {/* Advanced Mode Toggle */}
          <label className="advanced-toggle">
            <input
              type="checkbox"
              checked={mode === 'advanced'}
              onChange={(e) =>
                onModeChange(e.target.checked ? 'advanced' : 'simple')
              }
              disabled={isLoading}
            />
            <span>Advanced</span>
          </label>
        </div>
      </div>

      {mode === 'simple' ? (
        /* Simple Mode Form */
        <form onSubmit={handleSimpleSubmit} className="query-builder-form">
          <div className="form-row">
            <label htmlFor="nl-query">
              What data do you want to report on?
            </label>
            <textarea
              id="nl-query"
              value={naturalLanguageQuery}
              onChange={(e) => setNaturalLanguageQuery(e.target.value)}
              placeholder="Show me critical priority incidents that have been opened in the last month"
              disabled={isLoading}
              rows={4}
              className="nl-query-input"
            />
            {/* <div className="help-text">
              Describe the data you want in natural language
            </div> */}
          </div>

          <div className="form-row">
            <label htmlFor="report-question">
              What kind of report do you want to run?
              <span className="label-hint">(optional)</span>
            </label>
            <textarea
              id="report-question"
              value={reportQuestion}
              onChange={(e) => onReportQuestionChange(e.target.value)}
              placeholder="Show me a trend line of incidents by month"
              disabled={isLoading}
              rows={3}
              className="nl-query-input"
            />
          </div>

          <button
            type="submit"
            className="query-execute-btn"
            disabled={isLoading || !naturalLanguageQuery.trim()}
          >
            {isLoading ? 'Loading...' : 'Preview Data'}
          </button>
        </form>
      ) : (
        /* Advanced Mode Form */
        <form onSubmit={handleAdvancedSubmit} className="query-builder-form">
          <div className="form-row">
            <label htmlFor="table">Table</label>
            <select
              id="table"
              value={config.table}
              onChange={(e) => setConfig({ ...config, table: e.target.value })}
              disabled={isLoading}
            >
              {COMMON_TABLES.map((table) => (
                <option key={table.value} value={table.value}>
                  {table.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label htmlFor="query">
              Filters
              <span className="label-hint">
                (Leave empty to get all records)
              </span>
            </label>
            <input
              id="query"
              type="text"
              value={config.query}
              onChange={(e) => setConfig({ ...config, query: e.target.value })}
              placeholder="priority=1^active=true"
              disabled={isLoading}
            />
            {/* <div className="help-text">
              Use ServiceNow query syntax: = (equals), != (not equals), ^ (and),
              ^OR (or)
            </div> */}
          </div>

          <div className="form-row">
            <label htmlFor="limit">Limit</label>
            <input
              id="limit"
              type="number"
              min="1"
              max="10000"
              value={config.limit}
              onChange={(e) =>
                setConfig({
                  ...config,
                  limit: parseInt(e.target.value) || 100,
                })
              }
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <label htmlFor="report-question-advanced">
              What kind of report do you want to run?
              <span className="label-hint">(optional)</span>
            </label>
            <textarea
              id="report-question-advanced"
              value={reportQuestion}
              onChange={(e) => onReportQuestionChange(e.target.value)}
              placeholder="Show me a trend line of incidents by month"
              disabled={isLoading}
              rows={3}
              className="nl-query-input"
            />
          </div>

          <button
            type="submit"
            className="query-execute-btn"
            disabled={isLoading || !config.table}
          >
            {isLoading ? 'Loading Data...' : 'Preview Data'}
          </button>
        </form>
      )}

      {mode === 'advanced' && (
        <div className="query-examples">
          <h4>Common Searches:</h4>
          <div className="example-buttons">
            <button
              type="button"
              onClick={() =>
                handleTemplateLoad({
                  table: 'incident',
                  query: 'priority=1^active=true',
                })
              }
              disabled={isLoading}
              className="example-btn"
            >
              Open P1 Incidents
            </button>
            <button
              type="button"
              onClick={() =>
                handleTemplateLoad({
                  table: 'change_request',
                  query: 'state=1^ORstate=2',
                })
              }
              disabled={isLoading}
              className="example-btn"
            >
              Pending Changes
            </button>
            <button
              type="button"
              onClick={() =>
                handleTemplateLoad({
                  table: 'incident',
                  query: 'assignment_group=',
                })
              }
              disabled={isLoading}
              className="example-btn"
            >
              Unassigned Incidents
            </button>
            <button
              type="button"
              onClick={() =>
                handleTemplateLoad({
                  table: 'problem',
                  query: 'state=1^ORstate=2',
                })
              }
              disabled={isLoading}
              className="example-btn"
            >
              Open Problems
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
