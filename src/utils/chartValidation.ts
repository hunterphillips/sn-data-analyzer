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

  // Check 1: Has data
  if (!chartData.data || chartData.data.length === 0) {
    errors.push('Chart has no data to display');
    return { valid: false, errors, warnings };
  }

  // Get field names from first data record
  const dataFields = Object.keys(chartData.data[0] || {});

  if (dataFields.length === 0) {
    errors.push('Chart data records are empty');
    return { valid: false, errors, warnings };
  }

  // Check 2: Validate xAxisKey exists in data
  const xAxisKey = chartData.config.xAxisKey;
  if (xAxisKey && !dataFields.includes(xAxisKey)) {
    errors.push(
      `X-axis field "${xAxisKey}" not found in data. Available fields: ${dataFields.join(', ')}`
    );
  }

  // Check 3: Validate yAxisKey exists in data (for scatter plots)
  const yAxisKey = chartData.config.yAxisKey;
  if (yAxisKey && !dataFields.includes(yAxisKey)) {
    errors.push(
      `Y-axis field "${yAxisKey}" not found in data. Available fields: ${dataFields.join(', ')}`
    );
  }

  // Check 4: Validate chartConfig keys exist in data
  // This is the CRITICAL check that prevents field name mismatches
  const configFields = Object.keys(chartData.chartConfig || {});
  const invalidFields = configFields.filter((field) => !dataFields.includes(field));

  if (invalidFields.length > 0) {
    errors.push(
      `Chart configuration references fields not found in data: ${invalidFields.join(', ')}. ` +
        `Available fields in data: ${dataFields.join(', ')}`
    );
  }

  // Check 5: Data has values for configured fields (warnings only)
  const firstRow = chartData.data[0];
  configFields.forEach((field) => {
    if (dataFields.includes(field)) {
      const value = firstRow[field];
      if (value === undefined || value === null) {
        warnings.push(`Field "${field}" has no data in first record`);
      }
    }
  });

  // Check 6: Warn about pie charts with multiple metrics
  if (chartData.chartType === 'pie' && configFields.length > 1) {
    warnings.push(
      'Pie chart with multiple metrics may be confusing. Consider using a bar chart instead.'
    );
  }

  // Check 7: Warn if chart type requires xAxisKey but it's missing
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

  // Check 8: Warn if no chartConfig provided for multi-series charts
  if (
    ['multiBar', 'line', 'stackedArea', 'stackedBar', 'composed'].includes(chartData.chartType) &&
    configFields.length === 0
  ) {
    warnings.push(`Chart type "${chartData.chartType}" has no series defined in chartConfig`);
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
