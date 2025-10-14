/**
 * Embedded ServiceNow table schemas for common tables
 * Used for natural language query translation
 */

export interface FieldSchema {
  name: string;
  label: string;
  type: 'string' | 'integer' | 'choice' | 'reference' | 'boolean' | 'date' | 'datetime';
  choices?: Array<{ value: string; label: string }>;
  description?: string;
}

export interface TableSchema {
  name: string;
  label: string;
  fields: FieldSchema[];
}

export const SERVICE_NOW_SCHEMAS: TableSchema[] = [
  {
    name: 'incident',
    label: 'Incident',
    fields: [
      { name: 'number', label: 'Number', type: 'string', description: 'Incident number (e.g., INC0010001)' },
      { name: 'short_description', label: 'Short description', type: 'string' },
      { name: 'description', label: 'Description', type: 'string' },
      {
        name: 'priority',
        label: 'Priority',
        type: 'choice',
        choices: [
          { value: '1', label: 'Critical' },
          { value: '2', label: 'High' },
          { value: '3', label: 'Moderate' },
          { value: '4', label: 'Low' },
          { value: '5', label: 'Planning' },
        ],
      },
      {
        name: 'urgency',
        label: 'Urgency',
        type: 'choice',
        choices: [
          { value: '1', label: 'High' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'Low' },
        ],
      },
      {
        name: 'impact',
        label: 'Impact',
        type: 'choice',
        choices: [
          { value: '1', label: 'High' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'Low' },
        ],
      },
      {
        name: 'state',
        label: 'State',
        type: 'choice',
        choices: [
          { value: '1', label: 'New' },
          { value: '2', label: 'In Progress' },
          { value: '3', label: 'On Hold' },
          { value: '6', label: 'Resolved' },
          { value: '7', label: 'Closed' },
          { value: '8', label: 'Canceled' },
        ],
      },
      { name: 'active', label: 'Active', type: 'boolean', description: 'true for open/active, false for closed' },
      { name: 'assigned_to', label: 'Assigned to', type: 'reference', description: 'User assigned to the incident' },
      { name: 'assignment_group', label: 'Assignment group', type: 'reference', description: 'Group assigned to the incident' },
      { name: 'caller_id', label: 'Caller', type: 'reference' },
      { name: 'category', label: 'Category', type: 'string' },
      { name: 'subcategory', label: 'Subcategory', type: 'string' },
      { name: 'contact_type', label: 'Contact type', type: 'string', description: 'How incident was reported (e.g., phone, email, self-service)' },
      { name: 'opened_at', label: 'Opened', type: 'datetime' },
      { name: 'closed_at', label: 'Closed', type: 'datetime' },
      { name: 'resolved_at', label: 'Resolved', type: 'datetime' },
      { name: 'sys_created_on', label: 'Created', type: 'datetime' },
      { name: 'sys_updated_on', label: 'Updated', type: 'datetime' },
      { name: 'opened_by', label: 'Opened by', type: 'reference' },
      { name: 'resolved_by', label: 'Resolved by', type: 'reference' },
      { name: 'closed_by', label: 'Closed by', type: 'reference' },
    ],
  },
  {
    name: 'change_request',
    label: 'Change Request',
    fields: [
      { name: 'number', label: 'Number', type: 'string', description: 'Change request number (e.g., CHG0030001)' },
      { name: 'short_description', label: 'Short description', type: 'string' },
      { name: 'description', label: 'Description', type: 'string' },
      {
        name: 'type',
        label: 'Type',
        type: 'choice',
        choices: [
          { value: 'standard', label: 'Standard' },
          { value: 'normal', label: 'Normal' },
          { value: 'emergency', label: 'Emergency' },
        ],
      },
      {
        name: 'state',
        label: 'State',
        type: 'choice',
        choices: [
          { value: '-5', label: 'New' },
          { value: '-4', label: 'Assess' },
          { value: '-3', label: 'Authorize' },
          { value: '-2', label: 'Scheduled' },
          { value: '-1', label: 'Implement' },
          { value: '0', label: 'Review' },
          { value: '3', label: 'Closed' },
          { value: '4', label: 'Canceled' },
        ],
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'choice',
        choices: [
          { value: '1', label: 'Critical' },
          { value: '2', label: 'High' },
          { value: '3', label: 'Moderate' },
          { value: '4', label: 'Low' },
        ],
      },
      {
        name: 'risk',
        label: 'Risk',
        type: 'choice',
        choices: [
          { value: '1', label: 'High' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'Low' },
        ],
      },
      {
        name: 'impact',
        label: 'Impact',
        type: 'choice',
        choices: [
          { value: '1', label: 'High' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'Low' },
        ],
      },
      { name: 'assignment_group', label: 'Assignment group', type: 'reference' },
      { name: 'assigned_to', label: 'Assigned to', type: 'reference' },
      { name: 'requested_by', label: 'Requested by', type: 'reference' },
      { name: 'category', label: 'Category', type: 'string' },
      { name: 'start_date', label: 'Planned start date', type: 'datetime' },
      { name: 'end_date', label: 'Planned end date', type: 'datetime' },
      { name: 'sys_created_on', label: 'Created', type: 'datetime' },
      { name: 'sys_updated_on', label: 'Updated', type: 'datetime' },
    ],
  },
  {
    name: 'problem',
    label: 'Problem',
    fields: [
      { name: 'number', label: 'Number', type: 'string', description: 'Problem number (e.g., PRB0040001)' },
      { name: 'short_description', label: 'Short description', type: 'string' },
      { name: 'description', label: 'Description', type: 'string' },
      {
        name: 'state',
        label: 'State',
        type: 'choice',
        choices: [
          { value: '1', label: 'New' },
          { value: '2', label: 'Assess' },
          { value: '3', label: 'Root Cause Analysis' },
          { value: '4', label: 'Fix in Progress' },
          { value: '6', label: 'Resolved' },
          { value: '7', label: 'Closed' },
          { value: '8', label: 'Canceled' },
        ],
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'choice',
        choices: [
          { value: '1', label: 'Critical' },
          { value: '2', label: 'High' },
          { value: '3', label: 'Moderate' },
          { value: '4', label: 'Low' },
        ],
      },
      {
        name: 'impact',
        label: 'Impact',
        type: 'choice',
        choices: [
          { value: '1', label: 'High' },
          { value: '2', label: 'Medium' },
          { value: '3', label: 'Low' },
        ],
      },
      { name: 'assignment_group', label: 'Assignment group', type: 'reference' },
      { name: 'assigned_to', label: 'Assigned to', type: 'reference' },
      { name: 'category', label: 'Category', type: 'string' },
      { name: 'opened_at', label: 'Opened', type: 'datetime' },
      { name: 'closed_at', label: 'Closed', type: 'datetime' },
      { name: 'sys_created_on', label: 'Created', type: 'datetime' },
      { name: 'sys_updated_on', label: 'Updated', type: 'datetime' },
    ],
  },
  {
    name: 'task',
    label: 'Task',
    fields: [
      { name: 'number', label: 'Number', type: 'string' },
      { name: 'short_description', label: 'Short description', type: 'string' },
      { name: 'description', label: 'Description', type: 'string' },
      {
        name: 'state',
        label: 'State',
        type: 'choice',
        choices: [
          { value: '1', label: 'Open' },
          { value: '2', label: 'Work in Progress' },
          { value: '3', label: 'Closed Complete' },
          { value: '4', label: 'Closed Incomplete' },
          { value: '7', label: 'Closed Skipped' },
        ],
      },
      {
        name: 'priority',
        label: 'Priority',
        type: 'choice',
        choices: [
          { value: '1', label: 'Critical' },
          { value: '2', label: 'High' },
          { value: '3', label: 'Moderate' },
          { value: '4', label: 'Low' },
        ],
      },
      { name: 'active', label: 'Active', type: 'boolean' },
      { name: 'assignment_group', label: 'Assignment group', type: 'reference' },
      { name: 'assigned_to', label: 'Assigned to', type: 'reference' },
      { name: 'opened_at', label: 'Opened', type: 'datetime' },
      { name: 'closed_at', label: 'Closed', type: 'datetime' },
      { name: 'sys_created_on', label: 'Created', type: 'datetime' },
      { name: 'sys_updated_on', label: 'Updated', type: 'datetime' },
    ],
  },
];

/**
 * Get schema for a specific table
 */
export function getTableSchema(tableName: string): TableSchema | undefined {
  return SERVICE_NOW_SCHEMAS.find(schema => schema.name === tableName);
}

/**
 * Get all available table names
 */
export function getAvailableTables(): Array<{ name: string; label: string }> {
  return SERVICE_NOW_SCHEMAS.map(schema => ({
    name: schema.name,
    label: schema.label,
  }));
}

/**
 * Format schema for Claude prompt
 */
export function formatSchemaForPrompt(tableName?: string): string {
  const schemas = tableName
    ? SERVICE_NOW_SCHEMAS.filter(s => s.name === tableName)
    : SERVICE_NOW_SCHEMAS;

  return schemas
    .map(schema => {
      const fieldsDesc = schema.fields
        .map(field => {
          let desc = `  - ${field.name} (${field.label}): ${field.type}`;
          if (field.description) {
            desc += ` - ${field.description}`;
          }
          if (field.choices) {
            desc += `\n    Choices: ${field.choices.map(c => `${c.value}=${c.label}`).join(', ')}`;
          }
          return desc;
        })
        .join('\n');

      return `Table: ${schema.name} (${schema.label})\nFields:\n${fieldsDesc}`;
    })
    .join('\n\n');
}
