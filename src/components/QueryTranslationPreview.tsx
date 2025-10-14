import React from 'react';
import { CheckCircle, Edit, AlertCircle } from 'lucide-react';

export interface QueryTranslation {
  table: string;
  tableLabel: string;
  encodedQuery: string;
  fields: string[];
  limit: number;
  summary: string;
  displayValue?: 'true' | 'false' | 'all';
}

interface QueryTranslationPreviewProps {
  translation: QueryTranslation;
  onConfirm: () => void;
  onEdit: () => void;
  isLoading?: boolean;
}

export function QueryTranslationPreview({
  translation,
  onConfirm,
  onEdit,
  isLoading = false,
}: QueryTranslationPreviewProps) {
  return (
    <div className="query-translation-preview">
      <div className="translation-header">
        <CheckCircle size={20} className="translation-icon" />
        <h4>Query Preview</h4>
      </div>

      <div className="translation-content">
        <div className="translation-summary">
          <p>{translation.summary}</p>
        </div>

        <div className="translation-details">
          <div className="detail-row">
            <span className="detail-label">Table:</span>
            <span className="detail-value">{translation.tableLabel}</span>
          </div>

          {translation.encodedQuery && (
            <div className="detail-row">
              <span className="detail-label">Filters:</span>
              <span className="detail-value detail-code">{translation.encodedQuery}</span>
            </div>
          )}

          <div className="detail-row">
            <span className="detail-label">Columns:</span>
            <span className="detail-value">
              {translation.fields.length > 0
                ? translation.fields.join(', ')
                : 'All columns'}
            </span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Limit:</span>
            <span className="detail-value">{translation.limit} records</span>
          </div>
        </div>
      </div>

      <div className="translation-actions">
        <button
          type="button"
          onClick={onEdit}
          className="translation-btn translation-btn-secondary"
          disabled={isLoading}
        >
          <Edit size={16} />
          Edit Query
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="translation-btn translation-btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Loading Data...' : 'Get Data'}
        </button>
      </div>
    </div>
  );
}

interface QueryTranslationErrorProps {
  error: string;
  onRetry: () => void;
  onSwitchToAdvanced: () => void;
}

export function QueryTranslationError({
  error,
  onRetry,
  onSwitchToAdvanced,
}: QueryTranslationErrorProps) {
  return (
    <div className="query-translation-error">
      <div className="translation-header">
        <AlertCircle size={20} className="error-icon" />
        <h4>Could Not Translate Query</h4>
      </div>

      <div className="translation-content">
        <p className="error-message">{error}</p>
        <p className="error-help">
          Try rephrasing your request, or switch to Advanced mode to build the query manually.
        </p>
      </div>

      <div className="translation-actions">
        <button
          type="button"
          onClick={onSwitchToAdvanced}
          className="translation-btn translation-btn-secondary"
        >
          <Edit size={16} />
          Advanced Mode
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="translation-btn translation-btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
