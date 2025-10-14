// ServiceNow Table API types based on official documentation

/**
 * Query parameters for ServiceNow Table API requests
 * See: https://docs.servicenow.com/bundle/paris-application-development/page/integrate/inbound-rest/concept/c_TableAPI.html
 */
export interface TableQueryParams {
  /** Encoded query string (e.g., "priority=1^active=true") */
  sysparm_query?: string;
  /** Display value (true, false, all) - controls whether to return display values */
  sysparm_display_value?: 'true' | 'false' | 'all';
  /** Comma-separated list of fields to return */
  sysparm_fields?: string;
  /** Exclude reference link (true/false) */
  sysparm_exclude_reference_link?: boolean;
  /** Maximum number of records to return */
  sysparm_limit?: number;
  /** Starting record index (for pagination) */
  sysparm_offset?: number;
  /** Return only specified view fields */
  sysparm_view?: string;
  /** Suppress pagination header (true/false) */
  sysparm_suppress_pagination_header?: boolean;
}

/**
 * Response from ServiceNow Table API
 */
export interface TableAPIResponse<T = Record<string, any>> {
  result: T[];
}

/**
 * Single record response from Table API (for GET by sys_id)
 */
export interface TableAPIRecordResponse<T = Record<string, any>> {
  result: T;
}

/**
 * Common ServiceNow tables
 */
export enum ServiceNowTable {
  INCIDENT = 'incident',
  CHANGE_REQUEST = 'change_request',
  PROBLEM = 'problem',
  TASK = 'task',
  CMDB_CI = 'cmdb_ci',
  SYS_USER = 'sys_user',
  SYS_USER_GROUP = 'sys_user_group',
}

/**
 * Pre-built query template
 */
export interface QueryTemplate {
  id: string;
  name: string;
  description: string;
  table: string;
  query: string;
  fields?: string;
  limit?: number;
}

/**
 * Query configuration for the query builder
 */
export interface QueryConfig {
  table: string;
  query: string;
  fields?: string;
  limit: number;
  offset?: number;
  displayValue?: 'true' | 'false' | 'all';
}

/**
 * Common encoded query operators
 * See: https://docs.servicenow.com/bundle/paris-platform-administration/page/administer/reference-pages/concept/operators-filters-queries.html
 */
export const QUERY_OPERATORS = {
  EQUALS: '=',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_OR_EQUAL: '>=',
  LESS_OR_EQUAL: '<=',
  LIKE: 'LIKE',
  NOT_LIKE: 'NOTLIKE',
  STARTSWITH: 'STARTSWITH',
  ENDSWITH: 'ENDSWITH',
  IN: 'IN',
  NOT_IN: 'NOT IN',
  AND: '^',
  OR: '^OR',
  NQ: '^NQ', // New query (OR with grouping)
} as const;

/**
 * Data source type for the application
 */
export type DataSource = 'file' | 'query';
