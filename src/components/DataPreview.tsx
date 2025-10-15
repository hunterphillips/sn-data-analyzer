import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DataPreviewProps {
  data: Record<string, any>[];
  tableName: string;
  isExpanded: boolean;
  onToggle: () => void;
}

// Preview field configurations for common ServiceNow tables
const PREVIEW_FIELDS: Record<string, string[]> = {
  // Incident table
  incident: [
    'number',
    'short_description',
    'state',
    'incident_state',
    'priority',
    'severity',
    'category',
    'assignment_group',
    'assigned_to',
    'caller_id',
    'resolved_at',
    'sys_created_on',
  ],

  // Change Request table
  change_request: [
    'number',
    'short_description',
    'state',
    'type',
    'risk',
    'priority',
    'category',
    'assignment_group',
    'assigned_to',
    'requested_by',
    'start_date',
    'end_date',
    'sys_created_on',
  ],

  // Problem table
  problem: [
    'number',
    'short_description',
    'state',
    'priority',
    'impact',
    'category',
    'assignment_group',
    'assigned_to',
    'opened_at',
    'closed_at',
    'sys_created_on',
  ],

  // Task table
  task: [
    'number',
    'short_description',
    'state',
    'priority',
    'active',
    'assignment_group',
    'assigned_to',
    'opened_at',
    'closed_at',
    'sys_created_on',
  ],

  // CMDB CI tables (Configuration Items)
  cmdb_ci: [
    'name',
    'sys_class_name',
    'operational_status',
    'install_status',
    'assignment_group',
    'assigned_to',
    'location',
    'serial_number',
    'asset_tag',
    'sys_created_on',
  ],
  cmdb_ci_server: [
    'name',
    'sys_class_name',
    'operational_status',
    'install_status',
    'ip_address',
    'host_name',
    'os',
    'assignment_group',
    'assigned_to',
    'location',
  ],
  cmdb_ci_computer: [
    'name',
    'sys_class_name',
    'operational_status',
    'install_status',
    'ip_address',
    'host_name',
    'os',
    'assignment_group',
    'assigned_to',
    'location',
  ],
};

// Common fields to always include as fallback
const DEFAULT_PREVIEW_FIELDS = [
  'number',
  'name',
  'short_description',
  'state',
  'priority',
  'assignment_group',
  'assigned_to',
  'category',
  'sys_created_on',
  'sys_updated_on',
];

/**
 * Get the preview fields for a given table, filtering to only those that exist in the data
 */
function getPreviewFields(
  tableName: string,
  availableFields: string[]
): string[] {
  // Get configured preview fields for this table type
  let previewFields = PREVIEW_FIELDS[tableName] || DEFAULT_PREVIEW_FIELDS;

  // Filter to only fields that actually exist in the data
  const fieldsInData = previewFields.filter((field) =>
    availableFields.includes(field)
  );

  // If we have fewer than 5 fields, add more from available fields
  if (fieldsInData.length < 5) {
    const additionalFields = availableFields
      .filter((field) => !fieldsInData.includes(field))
      .slice(0, 10 - fieldsInData.length);

    return [...fieldsInData, ...additionalFields];
  }

  return fieldsInData;
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
        <p>No data to preview. Click "Preview" above to pull records.</p>
      </div>
    );
  }

  // Get all unique field names from the data
  const allFields = Array.from(
    new Set(data.flatMap((record) => Object.keys(record)))
  );

  // Get filtered preview fields based on table type
  const fields = getPreviewFields(tableName, allFields);

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
