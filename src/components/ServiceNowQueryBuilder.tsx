import React, { useState } from 'react';
import type { QueryConfig, ServiceNowTable } from '../types/servicenow';

export type QueryMode = 'simple' | 'advanced';

interface ServiceNowQueryBuilderProps {
  onExecuteQuery: (config: QueryConfig) => void;
  onNaturalLanguageQuery: (query: string, tableHint?: string) => void;
  isLoading?: boolean;
  mode: QueryMode;
  onModeChange: (mode: QueryMode) => void;
}

const COMMON_TABLES = [
  { value: 'incident', label: 'Incident' },
  { value: 'change_request', label: 'Change Request' },
  { value: 'problem', label: 'Problem' },
  { value: 'task', label: 'Task' },
  { value: 'cmdb_ci', label: 'Configuration Item' },
  { value: 'cmdb_ci_server', label: 'Server' },
  { value: 'cmdb_ci_computer', label: 'Computer' },
  { value: 'sys_user', label: 'User' },
  { value: 'sys_user_group', label: 'User Group' },
];

export function ServiceNowQueryBuilder({
  onExecuteQuery,
  onNaturalLanguageQuery,
  isLoading = false,
  mode,
  onModeChange,
}: ServiceNowQueryBuilderProps) {
  const [config, setConfig] = useState<QueryConfig>({
    table: 'incident',
    query: '',
    fields: '',
    limit: 100,
    offset: 0,
    displayValue: 'true',
  });

  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>('incident');

  const handleAdvancedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteQuery(config);
  };

  const handleSimpleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalLanguageQuery.trim()) return;
    onNaturalLanguageQuery(naturalLanguageQuery, selectedTable);
  };

  const handleTemplateLoad = (template: Partial<QueryConfig>) => {
    setConfig((prev) => ({ ...prev, ...template }));
  };

  return (
    <div className="query-builder">
      <div className="query-builder-header">
        <h3>Browse ServiceNow Data</h3>
        <p className="query-builder-description">
          {mode === 'simple'
            ? 'Describe the data you want in plain English'
            : 'Build a custom query with filters and field selection'}
        </p>

        {/* Mode Toggle */}
        <div className="query-mode-toggle">
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'simple' ? 'active' : ''}`}
            onClick={() => onModeChange('simple')}
            disabled={isLoading}
          >
            Simple
          </button>
          <button
            type="button"
            className={`mode-toggle-btn ${mode === 'advanced' ? 'active' : ''}`}
            onClick={() => onModeChange('advanced')}
            disabled={isLoading}
          >
            Advanced
          </button>
        </div>
      </div>

      {mode === 'simple' ? (
        /* Simple Mode Form */
        <form onSubmit={handleSimpleSubmit} className="query-builder-form">
          <div className="form-row">
            <label htmlFor="table-hint">Table (optional)</label>
            <select
              id="table-hint"
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={isLoading}
            >
              {COMMON_TABLES.map((table) => (
                <option key={table.value} value={table.value}>
                  {table.label}
                </option>
              ))}
            </select>
            <div className="help-text">
              Helps narrow down which table to search (can be overridden by your description)
            </div>
          </div>

          <div className="form-row">
            <label htmlFor="nl-query">What data do you want?</label>
            <textarea
              id="nl-query"
              value={naturalLanguageQuery}
              onChange={(e) => setNaturalLanguageQuery(e.target.value)}
              placeholder="Example: Show me all critical priority incidents that are still open&#10;Example: Get pending change requests with high risk&#10;Example: Find unassigned problems from the last 7 days"
              disabled={isLoading}
              rows={4}
              className="nl-query-input"
            />
            <div className="help-text">
              Describe the data you want in natural language
            </div>
          </div>

          <button
            type="submit"
            className="query-execute-btn"
            disabled={isLoading || !naturalLanguageQuery.trim()}
          >
            {isLoading ? 'Translating...' : 'Translate Query'}
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
              (optional - leave empty to get all records)
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
          <div className="help-text">
            Use ServiceNow query syntax: = (equals), != (not equals), ^ (and), ^OR (or)
          </div>
        </div>

        <div className="form-row">
          <label htmlFor="fields">
            Columns to Include
            <span className="label-hint">(comma-separated, leave empty for all)</span>
          </label>
          <input
            id="fields"
            type="text"
            value={config.fields}
            onChange={(e) => setConfig({ ...config, fields: e.target.value })}
            placeholder="number,short_description,priority,state"
            disabled={isLoading}
          />
        </div>

        <div className="form-row-group">
          <div className="form-row">
            <label htmlFor="limit">Limit</label>
            <input
              id="limit"
              type="number"
              min="1"
              max="10000"
              value={config.limit}
              onChange={(e) =>
                setConfig({ ...config, limit: parseInt(e.target.value) || 100 })
              }
              disabled={isLoading}
            />
          </div>

          <div className="form-row">
            <label htmlFor="displayValue">Display Value</label>
            <select
              id="displayValue"
              value={config.displayValue}
              onChange={(e) =>
                setConfig({
                  ...config,
                  displayValue: e.target.value as 'true' | 'false' | 'all',
                })
              }
              disabled={isLoading}
            >
              <option value="true">Display Values</option>
              <option value="false">Actual Values</option>
              <option value="all">Both</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="query-execute-btn"
          disabled={isLoading || !config.table}
        >
          {isLoading ? 'Loading Data...' : 'Get Data'}
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
                fields: 'number,short_description,priority,state,assigned_to',
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
                fields: 'number,short_description,state,risk,priority',
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
                fields: 'number,short_description,priority,sys_created_on',
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
                fields: 'number,short_description,state,priority',
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
