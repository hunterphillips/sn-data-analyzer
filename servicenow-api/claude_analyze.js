/**
 * This API accepts chat messages and file data, calls the Anthropic Claude API,
 * and returns AI-generated responses with optional chart data.
 *
 * Dependencies:
 * - ClaudeConfig (Script Include)
 * - ClaudeAPIClient (Script Include)
 * - MessageProcessor (Script Include)
 */

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  try {
    // Parse request body
    var requestBody = request.body.data;
    var messages = requestBody.messages || [];
    var fileData = requestBody.fileData || null;

    // Initialize helpers
    var processor = new MessageProcessor();
    var client = new ClaudeAPIClient();

    // Validate input
    var validation = processor.validate(messages);
    if (!validation.valid) {
      response.setStatus(400);
      response.setBody({
        error: validation.error,
      });
      return;
    }

    // Process messages and attach file data
    var anthropicMessages = processor.process(messages, fileData);

    // Call Claude API
    var result = client.call(anthropicMessages);

    if (!result.success) {
      response.setStatus(result.statusCode);
      response.setBody({
        error: result.error,
        details: result.details,
      });
      return;
    }

    // Return successful response
    response.setStatus(200);
    response.setBody({
      content: result.data.textContent,
      chartData: result.data.chartData,
      hasToolUse: result.data.hasToolUse,
    });
  } catch (e) {
    gs.error('Error in claude_analyze API: ' + e.message);
    response.setStatus(500);
    response.setBody({
      error: 'Internal server error',
      details: e.message,
    });
  }
})(request, response);
