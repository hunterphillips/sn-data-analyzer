/**
 * Script Include: ClaudeConfig
 * API Name: ClaudeConfig
 *
 * Configuration for Claude AI integration including system prompts,
 * tool definitions, and API settings.
 *
 * Usage in REST API:
 * var config = new ClaudeConfig();
 * var systemPrompt = config.getSystemPrompt();
 * var tools = config.getTools();
 */

var ClaudeConfig = Class.create();
ClaudeConfig.prototype = {
    initialize: function() {
        // API Configuration
        this.MODEL = 'claude-sonnet-4-5-20250929';
        this.MAX_TOKENS = 4096;
        this.TEMPERATURE = 0.7;
        this.API_VERSION = '2023-06-01';
        this.API_ENDPOINT = 'https://api.anthropic.com/v1/messages';
    },

    /**
     * Get the system prompt for ServiceNow data analysis
     * @returns {Array} System prompt array with cache control
     */
    getSystemPrompt: function() {
        return [{
            type: 'text',
            text: 'You are a ServiceNow data visualization expert. Your role is to analyze ServiceNow data exports and create clear, meaningful visualizations using generate_graph_data tool:\n\n' +
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
            cache_control: { type: 'ephemeral' }
        }];
    },

    /**
     * Get tool definitions for Claude API
     * @returns {Array} Tools array with cache control
     */
    getTools: function() {
        return [{
            name: 'generate_graph_data',
            description: 'Generate structured JSON data for creating ServiceNow data visualizations and charts.',
            input_schema: {
                type: 'object',
                properties: {
                    chartType: {
                        type: 'string',
                        enum: ['bar', 'multiBar', 'line', 'pie', 'area', 'stackedArea'],
                        description: 'The type of chart to generate'
                    },
                    config: {
                        type: 'object',
                        properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            xAxisKey: { type: 'string' }
                        },
                        required: ['title', 'description']
                    },
                    data: {
                        type: 'array',
                        items: {
                            type: 'object'
                        }
                    },
                    chartConfig: {
                        type: 'object'
                    }
                },
                required: ['chartType', 'config', 'data', 'chartConfig']
            },
            cache_control: { type: 'ephemeral' }
        }];
    },

    /**
     * Get complete request payload template
     * @param {Array} messages - Anthropic-formatted messages
     * @returns {Object} Request payload for Claude API
     */
    getRequestPayload: function(messages) {
        return {
            model: this.MODEL,
            max_tokens: this.MAX_TOKENS,
            temperature: this.TEMPERATURE,
            tools: this.getTools(),
            system: this.getSystemPrompt(),
            messages: messages
        };
    },

    type: 'ClaudeConfig'
};
