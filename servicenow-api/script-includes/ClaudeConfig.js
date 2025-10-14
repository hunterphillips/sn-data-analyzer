var ClaudeConfig = Class.create();
ClaudeConfig.prototype = {
  initialize: function () {
    // API Configuration
    this.MODEL =
      gs.getProperty('x_ipnll_data_ana_0.claude.default.model') ||
      'claude-sonnet-4-5-20250929';
    this.MAX_TOKENS = 4096;
    this.TEMPERATURE = 0.7;
    this.API_VERSION = '2023-06-01';
    this.API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
  },

  /**
   * Get the system prompt for ServiceNow data analysis
   * @returns {Array} System prompt array with cache control
   */
  getSystemPrompt: function () {
    return [
      {
        type: 'text',
        text:
          'You are a ServiceNow data visualization expert. Your role is to analyze ServiceNow data exports and create clear, meaningful visualizations using generate_graph_data tool:\n\n' +
          'Here are the chart types available and their ideal use cases:\n\n' +
          '1. LINE CHARTS ("line") - Time series data showing trends\n' +
          '2. BAR CHARTS ("bar") - Single metric comparisons\n' +
          '3. MULTI-BAR CHARTS ("multiBar") - Multiple metrics comparison\n' +
          '4. AREA CHARTS ("area") - Volume or quantity over time\n' +
          '5. STACKED AREA CHARTS ("stackedArea") - Component breakdowns over time\n' +
          '6. PIE CHARTS ("pie") - Distribution analysis\n\n' +
          'Common ServiceNow Data Patterns to Recognize:\n' +
          '- Incident records: number, priority, state, assignment_group, category\n' +
          '- Change requests: number, type, state, risk, approval_status\n' +
          '- Assets (CMDB): name, category, status, assigned_to, location\n' +
          '- Service catalog: requested_for, opened_by, state, approval\n' +
          '- Problem records: number, state, priority, related_incidents\n\n' +
          'Always generate real, contextually appropriate data and use proper formatting for ServiceNow metrics.',
        cache_control: { type: 'ephemeral' },
      },
    ];
  },

  /**
   * Get tool definitions for Claude API
   * @returns {Array} Tools array with cache control
   */
  getTools: function () {
    return [
      {
        name: 'generate_graph_data',
        description:
          'Generate structured JSON data for creating ServiceNow data visualizations and charts.',
        input_schema: {
          type: 'object',
          properties: {
            chartType: {
              type: 'string',
              enum: ['bar', 'multiBar', 'line', 'pie', 'area', 'stackedArea'],
              description: 'The type of chart to generate',
            },
            config: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                description: { type: 'string' },
                xAxisKey: { type: 'string' },
              },
              required: ['title', 'description'],
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            chartConfig: {
              type: 'object',
            },
          },
          required: ['chartType', 'config', 'data', 'chartConfig'],
        },
        cache_control: { type: 'ephemeral' },
      },
    ];
  },

  /**
   * Get complete request payload template
   * @param {Array} messages - Anthropic-formatted messages
   * @returns {Object} Request payload for Claude API
   */
  getRequestPayload: function (messages) {
    return {
      model: this.MODEL,
      max_tokens: this.MAX_TOKENS,
      temperature: this.TEMPERATURE,
      tools: this.getTools(),
      system: this.getSystemPrompt(),
      messages: messages,
    };
  },

  /**
   * Get system prompt for natural language query translation
   * @param {String} schema - Formatted table schema context
   * @returns {String} System prompt for query translation
   */
  getQueryTranslationPrompt: function (schema) {
    return (
      'You are a ServiceNow query translation assistant. Your job is to translate natural language requests into structured ServiceNow Table API query parameters.\n\n' +
      '## Available Tables and Fields\n\n' +
      schema +
      '\n\n' +
      '## ServiceNow Encoded Query Syntax\n\n' +
      'Use these operators to build encoded queries:\n' +
      '- = (equals): field=value\n' +
      '- != (not equals): field!=value\n' +
      '- > (greater than): field>value\n' +
      '- < (less than): field<value\n' +
      '- >= (greater or equal): field>=value\n' +
      '- <= (less or equal): field<=value\n' +
      '- ^ (AND): condition1^condition2\n' +
      '- ^OR (OR): condition1^ORcondition2\n' +
      '- LIKE (contains): fieldLIKEvalue\n' +
      '- STARTSWITH: fieldSTARTSWITHvalue\n' +
      '- ENDSWITH: fieldENDSWITHvalue\n\n' +
      'For boolean fields:\n' +
      '- active=true (for true)\n' +
      '- active=false (for false)\n\n' +
      'For reference fields (assignment_group, assigned_to, etc.):\n' +
      '- Use field= for "is empty" or "unassigned"\n' +
      '- Use field!= for "is not empty" or "assigned"\n\n' +
      'For date fields:\n' +
      '- Use javascript:gs.daysAgoStart(7) for "last 7 days"\n' +
      '- Use javascript:gs.daysAgoEnd(7) for "before 7 days ago"\n\n' +
      '## Examples\n\n' +
      'User: "Show me all critical priority incidents that are still open"\n' +
      'Output:\n' +
      '{\n' +
      '  "table": "incident",\n' +
      '  "tableLabel": "Incident",\n' +
      '  "encodedQuery": "priority=1^active=true",\n' +
      '  "fields": ["number", "short_description", "priority", "state", "assigned_to", "opened_at"],\n' +
      '  "limit": 100,\n' +
      '  "displayValue": "true",\n' +
      '  "summary": "Searching Incidents where priority is Critical (1) and active is true"\n' +
      '}\n\n' +
      'User: "Get pending change requests with high risk"\n' +
      'Output:\n' +
      '{\n' +
      '  "table": "change_request",\n' +
      '  "tableLabel": "Change Request",\n' +
      '  "encodedQuery": "state=-5^ORstate=-4^risk=1",\n' +
      '  "fields": ["number", "short_description", "state", "risk", "priority", "start_date"],\n' +
      '  "limit": 100,\n' +
      '  "displayValue": "true",\n' +
      '  "summary": "Searching Change Requests where state is New (-5) or Assess (-4) and risk is High (1)"\n' +
      '}\n\n' +
      'User: "Find unassigned problems from the last 7 days"\n' +
      'Output:\n' +
      '{\n' +
      '  "table": "problem",\n' +
      '  "tableLabel": "Problem",\n' +
      '  "encodedQuery": "assignment_group=^sys_created_on>=javascript:gs.daysAgoStart(7)",\n' +
      '  "fields": ["number", "short_description", "priority", "state", "sys_created_on"],\n' +
      '  "limit": 100,\n' +
      '  "displayValue": "true",\n' +
      '  "summary": "Searching Problems where assignment group is empty and created within the last 7 days"\n' +
      '}\n\n' +
      '## Instructions\n\n' +
      '1. Analyze the user\'s natural language request\n' +
      '2. Determine the most appropriate table (use table hint if provided, but can override if user is explicit)\n' +
      '3. Identify the fields/conditions mentioned\n' +
      '4. Build the encoded query using proper ServiceNow syntax\n' +
      '5. Select relevant fields to return (include key identifying fields + fields mentioned in query)\n' +
      '6. Create a human-readable summary of what the query will search for\n' +
      '7. Return ONLY valid JSON\n\n' +
      '## Making Assumptions vs Asking for Clarification\n\n' +
      'PREFER making reasonable assumptions. Only ask for clarification when truly ambiguous.\n\n' +
      'Good assumptions to make:\n' +
      '- Time period not specified? Default to last 30 days: sys_created_on>=javascript:gs.daysAgoStart(30)\n' +
      '- Priority mentioned without number? Map "critical"=1, "high"=2, "moderate"=3, "low"=4\n' +
      '- State mentioned as "open"? Use active=true\n' +
      '- Limit not specified? Use 100\n\n' +
      'If you MUST ask for clarification (rare), return JSON with clarification field:\n' +
      '{\n' +
      '  "clarification": "Your question to the user",\n' +
      '  "suggestion": "Optional: A suggested default assumption you could make"\n' +
      '}\n\n' +
      'Otherwise, return the standard query format:\n' +
      '{\n' +
      '  "table": "table_name",\n' +
      '  "tableLabel": "Human Readable Table Name",\n' +
      '  "encodedQuery": "field1=value1^field2=value2",\n' +
      '  "fields": ["number", "short_description", "priority", "state", "sys_created_on"],\n' +
      '  "limit": 100,\n' +
      '  "displayValue": "true",\n' +
      '  "summary": "Human readable description of what this query searches for"\n' +
      '}\n\n' +
      'IMPORTANT:\n' +
      '- Always return valid JSON only\n' +
      '- Use actual field names from the schema (not labels)\n' +
      '- Use actual choice values (numbers) not labels\n' +
      '- If encodedQuery is empty string, it means "get all records"\n' +
      '- Always include key identifier fields like "number" and "short_description"\n' +
      '- Always include sys_created_on for time-based queries\n' +
      '- Limit should typically be 100 unless user specifies otherwise\n' +
      '- DisplayValue should be "true" for human-readable results'
    );
  },

  type: 'ClaudeConfig',
};
