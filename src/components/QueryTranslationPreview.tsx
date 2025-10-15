import React from 'react';
import { CheckCircle, Edit, AlertCircle, MessageCircle } from 'lucide-react';

export interface QueryTranslation {
  table: string;
  tableLabel: string;
  encodedQuery: string;
  limit: number;
  summary: string;
  displayValue?: 'true' | 'false' | 'all';
}

export interface QueryClarification {
  needsClarification: true;
  message: string;
  suggestion: string | null;
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
    <div className="card query-translation-preview">
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
            <span className="detail-label">Limit:</span>
            <span className="detail-value">{translation.limit} records</span>
          </div>
        </div>
      </div>

      <div className="translation-actions">
        <button
          type="button"
          onClick={onEdit}
          className="btn translation-btn translation-btn-secondary"
          disabled={isLoading}
        >
          <Edit size={16} />
          Edit Query
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="btn translation-btn translation-btn-primary"
          disabled={isLoading}
        >
          {isLoading ? 'Loading Data...' : 'Refresh Data'}
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
    <div className="card query-translation-error">
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
          className="btn translation-btn translation-btn-secondary"
        >
          <Edit size={16} />
          Advanced Mode
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="btn translation-btn translation-btn-primary"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

interface QueryClarificationRequestProps {
  clarification: QueryClarification;
  onRefine: () => void;
  onUseDefault?: () => void;
}

export function QueryClarificationRequest({
  clarification,
  onRefine,
  onUseDefault,
}: QueryClarificationRequestProps) {
  return (
    <div className="card query-clarification-request">
      <div className="translation-header">
        <MessageCircle size={20} className="clarification-icon" />
        <h4>Need More Information</h4>
      </div>

      <div className="translation-content">
        <p className="clarification-message">{clarification.message}</p>
        {clarification.suggestion && (
          <p className="clarification-suggestion">
            <strong>Suggestion:</strong> {clarification.suggestion}
          </p>
        )}
        <p className="clarification-help">
          Please refine your request with more details, or I can use a default assumption.
        </p>
      </div>

      <div className="translation-actions">
        <button
          type="button"
          onClick={onRefine}
          className="btn translation-btn translation-btn-secondary"
        >
          <Edit size={16} />
          Refine Query
        </button>
        {clarification.suggestion && onUseDefault && (
          <button
            type="button"
            onClick={onUseDefault}
            className="btn translation-btn translation-btn-primary"
          >
            Use Default
          </button>
        )}
      </div>
    </div>
  );
}
