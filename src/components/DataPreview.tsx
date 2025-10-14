import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DataPreviewProps {
  data: Record<string, any>[];
  tableName: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function DataPreview({
  data,
  tableName,
  isExpanded,
  onToggle,
}: DataPreviewProps) {
  if (!data || data.length === 0) {
    return (
      <div className="data-preview-empty">
        <p>No data to preview. Click "Preview Data" above to pull records.</p>
      </div>
    );
  }

  // Get all unique field names from the data
  const fields = Array.from(
    new Set(data.flatMap((record) => Object.keys(record)))
  );

  // Limit preview to first 50 records for performance
  const previewData = data.slice(0, 50);
  const hasMore = data.length > 50;

  return (
    <div className="data-preview">
      <div className="data-preview-header">
        <div className="data-preview-info">
          <h3>Data Preview</h3>
          <p>
            <strong>{data.length}</strong> records from{' '}
            <strong>{tableName}</strong>
            {hasMore && ' (showing first 50)'}
          </p>
        </div>
        <button onClick={onToggle} className="toggle-preview-btn">
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Hide Preview
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show Preview
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="data-preview-table-container">
            <table className="data-preview-table">
              <thead>
                <tr>
                  <th className="row-number">#</th>
                  {fields.map((field) => (
                    <th key={field}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((record, index) => (
                  <tr key={index}>
                    <td className="row-number">{index + 1}</td>
                    {fields.map((field) => (
                      <td key={field}>{formatCellValue(record[field])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="data-preview-footer">
              Showing {previewData.length} of {data.length} records.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    // Handle reference fields that might be objects
    if (value.display_value) {
      return value.display_value;
    }
    if (value.value) {
      return value.value;
    }
    return JSON.stringify(value);
  }

  // Truncate long strings
  const stringValue = String(value);
  if (stringValue.length > 100) {
    return stringValue.substring(0, 97) + '...';
  }

  return stringValue;
}
