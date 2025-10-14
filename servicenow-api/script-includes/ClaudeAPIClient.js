/**
 * Script Include: ClaudeAPIClient
 * API Name: ClaudeAPIClient
 *
 * Client for making requests to Anthropic Claude API.
 * Handles API key management, request construction, and response parsing.
 *
 * Usage in REST API:
 * var client = new ClaudeAPIClient();
 * var result = client.call(anthropicMessages);
 */

var ClaudeAPIClient = Class.create();
ClaudeAPIClient.prototype = {
    initialize: function() {
        this.config = new ClaudeConfig();
        this.apiKey = null;
    },

    /**
     * Get Anthropic API key from system properties
     * @returns {String|null} API key or null if not configured
     */
    _getAPIKey: function() {
        if (this.apiKey) {
            return this.apiKey;
        }

        // Try to get from system property
        this.apiKey = gs.getProperty('anthropic.api.key');

        if (!this.apiKey || this.apiKey === '') {
            gs.error('ClaudeAPIClient: Anthropic API key not found in system properties');
            return null;
        }

        return this.apiKey;
    },

    /**
     * Call Claude API with messages
     * @param {Array} messages - Anthropic-formatted messages
     * @returns {Object} Response object with {success, data, error, statusCode}
     */
    call: function(messages) {
        return this._makeAPICall(messages, null);
    },

    /**
     * Call Claude API with custom system prompt
     * @param {String} systemPrompt - Custom system prompt
     * @param {Array} messages - Anthropic-formatted messages
     * @returns {Object} Response object with {success, data, error, statusCode}
     */
    callWithSystem: function(systemPrompt, messages) {
        return this._makeAPICall(messages, systemPrompt);
    },

    /**
     * Internal method to make API call
     * @param {Array} messages - Anthropic-formatted messages
     * @param {String|null} customSystem - Optional custom system prompt
     * @returns {Object} Response object with {success, data, error, statusCode}
     */
    _makeAPICall: function(messages, customSystem) {
        var apiKey = this._getAPIKey();

        if (!apiKey) {
            return {
                success: false,
                error: 'Anthropic API key not configured',
                statusCode: 500
            };
        }

        // Prepare request payload
        var requestPayload = this.config.getRequestPayload(messages);

        // Override system prompt if provided
        if (customSystem) {
            requestPayload.system = customSystem;
        }

        try {
            // Create REST message
            var restMessage = new sn_ws.RESTMessageV2();
            restMessage.setHttpMethod('POST');
            restMessage.setEndpoint(this.config.API_ENDPOINT);
            restMessage.setRequestHeader('Content-Type', 'application/json');
            restMessage.setRequestHeader('x-api-key', apiKey);
            restMessage.setRequestHeader('anthropic-version', this.config.API_VERSION);
            restMessage.setRequestBody(JSON.stringify(requestPayload));

            // Execute API call
            var apiResponse = restMessage.execute();
            var statusCode = apiResponse.getStatusCode();

            if (statusCode !== 200) {
                gs.error('ClaudeAPIClient: API error ' + statusCode + ' - ' + apiResponse.getBody());
                return {
                    success: false,
                    error: 'Claude API error',
                    details: apiResponse.getBody(),
                    statusCode: statusCode
                };
            }

            // Parse response
            var claudeResponse = JSON.parse(apiResponse.getBody());

            return {
                success: true,
                data: this._parseResponse(claudeResponse),
                statusCode: 200
            };

        } catch (e) {
            gs.error('ClaudeAPIClient: Exception - ' + e.message);
            return {
                success: false,
                error: 'API call failed',
                details: e.message,
                statusCode: 500
            };
        }
    },

    /**
     * Parse Claude API response to extract text and tool use
     * @param {Object} claudeResponse - Raw Claude API response
     * @returns {Object} Parsed response with {textContent, chartData, hasToolUse}
     */
    _parseResponse: function(claudeResponse) {
        var textContent = '';
        var chartData = null;

        if (!claudeResponse.content) {
            return {
                textContent: '',
                chartData: null,
                hasToolUse: false
            };
        }

        for (var i = 0; i < claudeResponse.content.length; i++) {
            var content = claudeResponse.content[i];

            if (content.type === 'text') {
                textContent = content.text;
            } else if (content.type === 'tool_use' && content.name === 'generate_graph_data') {
                chartData = content.input;
            }
        }

        return {
            textContent: textContent,
            chartData: chartData,
            hasToolUse: chartData !== null
        };
    },

    type: 'ClaudeAPIClient'
};
