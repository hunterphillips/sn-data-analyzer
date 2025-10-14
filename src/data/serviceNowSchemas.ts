/**
 * Embedded ServiceNow table schemas for common tables
 * Used for natural language query translation
 */

export interface FieldSchema {
  name: string;
  label: string;
  type:
    | 'string'
    | 'integer'
    | 'choice'
    | 'reference'
    | 'boolean'
    | 'date'
    | 'datetime';
  choices?: Array<{ value: string; label: string }>;
  description?: string;
  reference?: string;
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
      {
        name: 'asset',
        label: 'Asset',
        type: 'reference',
        reference: 'alm_asset',
      },
      {
        name: 'business_impact',
        label: 'Business impact',
        type: 'string',
      },
      {
        name: 'business_stc',
        label: 'Business resolve time',
        type: 'choice',
        choices: [],
      },
      {
        name: 'caller_id',
        label: 'Caller',
        type: 'reference',
        reference: 'sys_user',
      },
      {
        name: 'category',
        label: 'Category',
        type: 'string',
      },
      {
        name: 'caused_by',
        label: 'Caused by Change',
        type: 'reference',
        reference: 'change_request',
      },
      {
        name: 'rfc',
        label: 'Change Request',
        type: 'reference',
        reference: 'change_request',
      },
      {
        name: 'child_incidents',
        label: 'Child Incidents',
        type: 'choice',
        choices: [],
      },
      {
        name: 'close_code',
        label: 'Close code',
        type: 'string',
      },
      {
        name: 'u_down_time_end',
        label: 'Down time end',
        type: 'datetime',
      },
      {
        name: 'u_down_time_start',
        label: 'Down time start',
        type: 'datetime',
      },
      {
        name: 'incident_state',
        label: 'Incident state',
        type: 'choice',
        choices: [
          {
            value: '1',
            label: 'New',
          },
          {
            value: '2',
            label: 'In Progress',
          },
          {
            value: '3',
            label: 'On Hold',
          },
          {
            value: '6',
            label: 'Resolved',
          },
          {
            value: '7',
            label: 'Closed',
          },
          {
            value: '8',
            label: 'Canceled',
          },
        ],
      },
      {
        name: 'reopened_time',
        label: 'Last reopened at',
        type: 'datetime',
      },
      {
        name: 'reopened_by',
        label: 'Last reopened by',
        type: 'reference',
        reference: 'sys_user',
      },
      {
        name: 'notify',
        label: 'Notify',
        type: 'choice',
        choices: [
          {
            value: '1',
            label: 'Do Not Notify',
          },
          {
            value: '2',
            label: 'Send Email',
          },
          {
            value: '3',
            label: 'Telephone',
          },
        ],
      },
      {
        name: 'u_number_of_group_members',
        label: 'Number of Group Members',
        type: 'choice',
        choices: [],
      },
      {
        name: 'hold_reason',
        label: 'On hold reason',
        type: 'choice',
        choices: [
          {
            value: '1',
            label: 'Awaiting Caller',
          },
          {
            value: '5',
            label: 'Awaiting Change',
          },
          {
            value: '3',
            label: 'Awaiting Problem',
          },
          {
            value: '4',
            label: 'Awaiting Vendor',
          },
        ],
      },
      {
        name: 'origin_id',
        label: 'Origin',
        type: 'string',
      },
      {
        name: 'origin_table',
        label: 'Origin table',
        type: 'string',
      },
      {
        name: 'parent_incident',
        label: 'Parent Incident',
        type: 'reference',
        reference: 'incident',
      },
      {
        name: 'cause',
        label: 'Probable cause',
        type: 'string',
      },
      {
        name: 'problem_id',
        label: 'Problem',
        type: 'reference',
        reference: 'problem',
      },
      {
        name: 'reopen_count',
        label: 'Reopen count',
        type: 'choice',
        choices: [],
      },
      {
        name: 'calendar_stc',
        label: 'Resolve time',
        type: 'choice',
        choices: [],
      },
      {
        name: 'resolved_at',
        label: 'Resolved',
        type: 'datetime',
      },
      {
        name: 'resolved_by',
        label: 'Resolved by',
        type: 'reference',
        reference: 'sys_user',
      },
      {
        name: 'severity',
        label: 'Severity',
        type: 'choice',
        choices: [
          {
            value: '1',
            label: '1 - High',
          },
          {
            value: '2',
            label: '2 - Medium',
          },
          {
            value: '3',
            label: '3 - Low',
          },
        ],
      },
      {
        name: 'subcategory',
        label: 'Subcategory',
        type: 'string',
      },
    ],
  },
  {
    name: 'change_request',
    label: 'Change Request',
    fields: [
      {
        name: 'backout_plan',
        label: 'Backout plan',
        type: 'string',
      },
      {
        name: 'cab_date_time',
        label: 'CAB date/time',
        type: 'datetime',
      },
      {
        name: 'cab_delegate',
        label: 'CAB delegate',
        type: 'reference',
        reference: 'sys_user',
      },
      {
        name: 'cab_recommendation',
        label: 'CAB recommendation',
        type: 'string',
      },
      {
        name: 'cab_required',
        label: 'CAB required',
        type: 'boolean',
      },
      {
        name: 'category',
        label: 'Category',
        type: 'string',
      },
      {
        name: 'change_plan',
        label: 'Change plan',
        type: 'string',
      },
      {
        name: 'close_code',
        label: 'Close code',
        type: 'string',
      },
      {
        name: 'conflict_last_run',
        label: 'Conflict last run',
        type: 'datetime',
      },
      {
        name: 'conflict_status',
        label: 'Conflict status',
        type: 'string',
      },
      {
        name: 'copied_from',
        label: 'Copied from',
        type: 'reference',
        reference: 'change_request',
      },
      {
        name: 'devops_change',
        label: 'DevOps change',
        type: 'boolean',
      },
      {
        name: 'implementation_plan',
        label: 'Implementation plan',
        type: 'string',
      },
      {
        name: 'justification',
        label: 'Justification',
        type: 'string',
      },
      {
        name: 'chg_model',
        label: 'Model',
        type: 'reference',
        reference: 'chg_model',
      },
      {
        name: 'on_hold',
        label: 'On hold',
        type: 'boolean',
      },
      {
        name: 'on_hold_task',
        label: 'On Hold Change Tasks',
        type: 'string',
      },
      {
        name: 'on_hold_reason',
        label: 'On hold reason',
        type: 'string',
      },
      {
        name: 'outside_maintenance_schedule',
        label: 'Outside maintenance schedule',
        type: 'boolean',
      },
      {
        name: 'phase',
        label: 'Phase',
        type: 'string',
      },
      {
        name: 'phase_state',
        label: 'Phase state',
        type: 'string',
      },
      {
        name: 'end_date',
        label: 'Planned end date',
        type: 'datetime',
      },
      {
        name: 'start_date',
        label: 'Planned start date',
        type: 'datetime',
      },
      {
        name: 'production_system',
        label: 'Production system',
        type: 'boolean',
      },
      {
        name: 'reason',
        label: 'Reason',
        type: 'string',
      },
      {
        name: 'requested_by',
        label: 'Requested by',
        type: 'reference',
        reference: 'sys_user',
      },
      {
        name: 'requested_by_date',
        label: 'Requested by date',
        type: 'datetime',
      },
      {
        name: 'review_comments',
        label: 'Review comments',
        type: 'string',
      },
      {
        name: 'review_date',
        label: 'Review date',
        type: 'date',
      },
      {
        name: 'review_status',
        label: 'Review status',
        type: 'choice',
        choices: [
          {
            value: '1',
            label: 'Success',
          },
          {
            value: '2',
            label: 'Fail',
          },
        ],
      },
      {
        name: 'risk',
        label: 'Risk',
        type: 'choice',
        choices: [
          {
            value: '2',
            label: 'High',
          },
          {
            value: '3',
            label: 'Moderate',
          },
          {
            value: '4',
            label: 'Low',
          },
        ],
      },
      {
        name: 'risk_impact_analysis',
        label: 'Risk and impact analysis',
        type: 'string',
      },
      {
        name: 'scope',
        label: 'Scope',
        type: 'choice',
        choices: [
          {
            value: '1',
            label: 'Massive',
          },
          {
            value: '2',
            label: 'Large',
          },
          {
            value: '3',
            label: 'Medium',
          },
          {
            value: '4',
            label: 'Small',
          },
          {
            value: '5',
            label: 'Tiny',
          },
        ],
      },
      {
        name: 'std_change_producer_version',
        label: 'Standard Change Template version',
        type: 'reference',
        reference: 'std_change_producer_version',
      },
      {
        name: 'test_plan',
        label: 'Test plan',
        type: 'string',
      },
      {
        name: 'type',
        label: 'Type',
        type: 'string',
      },
      {
        name: 'unauthorized',
        label: 'Unauthorized',
        type: 'boolean',
      },
    ],
  },
  {
    name: 'problem',
    label: 'Problem',
    fields: [
      {
        name: 'number',
        label: 'Number',
        type: 'string',
        description: 'Problem number (e.g., PRB0040001)',
      },
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
      {
        name: 'assignment_group',
        label: 'Assignment group',
        type: 'reference',
      },
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
      {
        name: 'assignment_group',
        label: 'Assignment group',
        type: 'reference',
      },
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
  return SERVICE_NOW_SCHEMAS.find((schema) => schema.name === tableName);
}

/**
 * Get all available table names
 */
export function getAvailableTables(): Array<{ name: string; label: string }> {
  return SERVICE_NOW_SCHEMAS.map((schema) => ({
    name: schema.name,
    label: schema.label,
  }));
}

/**
 * Format schema for Claude prompt
 */
export function formatSchemaForPrompt(tableName?: string): string {
  const schemas = tableName
    ? SERVICE_NOW_SCHEMAS.filter((s) => s.name === tableName)
    : SERVICE_NOW_SCHEMAS;

  return schemas
    .map((schema) => {
      const fieldsDesc = schema.fields
        .map((field) => {
          let desc = `  - ${field.name} (${field.label}): ${field.type}`;
          if (field.description) {
            desc += ` - ${field.description}`;
          }
          if (field.choices) {
            desc += `\n    Choices: ${field.choices
              .map((c) => `${c.value}=${c.label}`)
              .join(', ')}`;
          }
          return desc;
        })
        .join('\n');

      return `Table: ${schema.name} (${schema.label})\nFields:\n${fieldsDesc}`;
    })
    .join('\n\n');
}
