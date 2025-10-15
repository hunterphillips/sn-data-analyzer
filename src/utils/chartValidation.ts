import type { ChartData } from '../types/chart';

/**
 * Validation result structure
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates chart data structure to ensure field names match between
 * chartConfig and actual data array.
 *
 * This validation prevents runtime errors when Claude AI generates chart
 * specifications with mismatched field names (e.g., "Critical Incidents"
 * instead of "critical_incidents").
 *
 * @param chartData - Chart data from Claude AI tool use
 * @returns Validation result with errors and warnings
 *
 * @example
 * ```typescript
 * const validation = validateChartData(chartData);
 * if (!validation.valid) {
 *   console.error('Chart errors:', validation.errors);
 *   // Show error UI to user
 * }
 * if (validation.warnings.length > 0) {
 *   console.warn('Chart warnings:', validation.warnings);
 *   // Still render chart but log warnings
 * }
 * ```
 */
export function validateChartData(chartData: ChartData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check 1: Has no data (warning)
  if (!chartData.data || chartData.data.length === 0) {
    warnings.push('Chart has no data to display');
    return { valid: true, errors, warnings };
  }

  // Get field names from first data record
  const dataFields = Object.keys(chartData.data[0] || {});

  if (dataFields.length === 0) {
    warnings.push('Chart data records are empty');
    return { valid: true, errors, warnings };
  }

  // Check 2: Validate xAxisKey exists in data
  const xAxisKey = chartData.config.xAxisKey;
  if (xAxisKey && !dataFields.includes(xAxisKey)) {
    errors.push(
      `X-axis field "${xAxisKey}" not found in data. Available fields: ${dataFields.join(
        ', '
      )}`
    );
  }

  // Check 3: Validate yAxisKey exists in data (for scatter plots)
  const yAxisKey = chartData.config.yAxisKey;
  if (yAxisKey && !dataFields.includes(yAxisKey)) {
    errors.push(
      `Y-axis field "${yAxisKey}" not found in data. Available fields: ${dataFields.join(
        ', '
      )}`
    );
  }

  // Check 4: Validate chartConfig keys exist in data
  const configFields = Object.keys(chartData.chartConfig || {});
  const invalidFields = configFields.filter(
    (field) => !dataFields.includes(field)
  );

  if (invalidFields.length > 0) {
    errors.push(
      `Chart configuration references fields not found in data: ${invalidFields.join(
        ', '
      )}. ` + `Available fields in data: ${dataFields.join(', ')}`
    );
  }

  // Warn if chart type requires xAxisKey but it's missing
  const chartTypesRequiringXAxis: ChartData['chartType'][] = [
    'bar',
    'multiBar',
    'line',
    'area',
    'stackedArea',
    'horizontalBar',
    'stackedBar',
    'composed',
  ];

  if (chartTypesRequiringXAxis.includes(chartData.chartType) && !xAxisKey) {
    warnings.push(
      `Chart type "${chartData.chartType}" typically requires an xAxisKey in config`
    );
  }

  // Warn if no chartConfig provided for multi-series charts
  if (
    ['multiBar', 'line', 'stackedArea', 'stackedBar', 'composed'].includes(
      chartData.chartType
    ) &&
    configFields.length === 0
  ) {
    warnings.push(
      `Chart type "${chartData.chartType}" has no series defined in chartConfig`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Helper to get a user-friendly error message for validation failures
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.valid) return '';

  const errorList = result.errors.map((err) => `• ${err}`).join('\n');
  return `Chart validation failed:\n${errorList}`;
}

/**
 * Helper to check if a specific validation error indicates a field mismatch
 * (useful for detecting prompt engineering issues)
 */
export function hasFieldMismatchError(result: ValidationResult): boolean {
  return result.errors.some(
    (err) =>
      err.includes('not found in data') ||
      err.includes('references fields not found') ||
      err.includes('X-axis field') ||
      err.includes('Y-axis field')
  );
}

/**
 * Helper to check if chart data is empty
 * (useful for showing empty state instead of rendering attempt)
 */
export function isChartDataEmpty(chartData: ChartData): boolean {
  return !chartData.data || chartData.data.length === 0;
}
