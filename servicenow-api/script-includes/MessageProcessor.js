/**
 * Script Include: MessageProcessor
 * API Name: MessageProcessor
 *
 * Processes and validates messages for Claude API requests.
 * Handles message transformation and file data attachment.
 *
 * Usage in REST API:
 * var processor = new MessageProcessor();
 * var result = processor.process(requestMessages, fileData);
 */

var MessageProcessor = Class.create();
MessageProcessor.prototype = {
    initialize: function() {
    },

    /**
     * Validate messages array
     * @param {Array} messages - Messages from request
     * @returns {Object} Validation result {valid, error}
     */
    validate: function(messages) {
        if (!messages || !Array.isArray(messages)) {
            return {
                valid: false,
                error: 'Messages must be an array'
            };
        }

        if (messages.length === 0) {
            return {
                valid: false,
                error: 'Messages array is required'
            };
        }

        return {
            valid: true
        };
    },

    /**
     * Process messages and attach file data if present
     * @param {Array} messages - Messages from request
     * @param {Object|null} fileData - Optional file data to attach
     * @returns {Array} Anthropic-formatted messages
     */
    process: function(messages, fileData) {
        var anthropicMessages = [];

        // Transform messages to Anthropic format
        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            anthropicMessages.push({
                role: msg.role,
                content: msg.content
            });
        }

        // Attach file data to last message if present
        if (fileData && fileData.base64) {
            this._attachFileData(anthropicMessages, fileData);
        }

        return anthropicMessages;
    },

    /**
     * Attach file data to the last message
     * @param {Array} messages - Messages array to modify
     * @param {Object} fileData - File data with base64, fileName
     * @private
     */
    _attachFileData: function(messages, fileData) {
        if (messages.length === 0) {
            return;
        }

        try {
            var lastMessage = messages[messages.length - 1];
            var decodedText = decodeURIComponent(gs.base64Decode(fileData.base64));

            // Prepend file contents to the message
            var fileHeader = 'File contents of ' + fileData.fileName + ':\n\n';
            var originalContent = lastMessage.content || '';

            lastMessage.content = fileHeader + decodedText + '\n\n' + originalContent;

        } catch (e) {
            gs.warn('MessageProcessor: Failed to decode file data - ' + e.message);
            // Continue without file attachment
        }
    },

    type: 'MessageProcessor'
};
