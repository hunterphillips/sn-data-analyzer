/**
 * Query Translation API
 *
 * Translates natural language queries into structured ServiceNow Table API parameters
 * using Claude AI with embedded schema context.
 *
 * Input: { naturalLanguage: string, tableHint?: string, schema: string }
 * Output: { table: string, tableLabel: string, encodedQuery: string, fields: string[], limit: number, summary: string }
 */

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  try {
    // Parse request body
    var requestBody = request.body.data;
    var naturalLanguage = requestBody.naturalLanguage || '';
    var tableHint = requestBody.tableHint || '';
    var schema = requestBody.schema || '';

    // Validate input
    if (!naturalLanguage || !naturalLanguage.trim()) {
      response.setStatus(400);
      response.setBody({
        error: 'Natural language query is required',
      });
      return;
    }

    if (!schema || !schema.trim()) {
      response.setStatus(400);
      response.setBody({
        error: 'Table schema context is required',
      });
      return;
    }

    // Build system prompt with schema context using ClaudeConfig
    var config = new ClaudeConfig();
    var systemPrompt = config.getQueryTranslationPrompt(schema);

    // Build user message with table hint if provided
    var userMessage = naturalLanguage;
    if (tableHint) {
      userMessage =
        'Table hint: ' + tableHint + '\n\nQuery: ' + naturalLanguage;
    }

    // Initialize Claude client
    var client = new ClaudeAPIClient();

    // Build messages array
    var messages = [
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Call Claude API with system prompt
    var result = client.callWithSystem(systemPrompt, messages);

    if (!result.success) {
      response.setStatus(result.statusCode);
      response.setBody({
        error: result.error,
        details: result.details,
      });
      return;
    }

    // Extract JSON from Claude's response
    var translationJSON = extractJSON(result.data.textContent);

    if (!translationJSON) {
      response.setStatus(500);
      response.setBody({
        error: 'Could not parse query translation from AI response',
        details: result.data.textContent,
      });
      return;
    }

    // Parse and validate translation
    var translation = JSON.parse(translationJSON);

    // Check if this is a clarification request
    if (translation.clarification) {
      response.setStatus(200);
      response.setBody({
        needsClarification: true,
        message: translation.clarification,
        suggestion: translation.suggestion || null,
      });
      return;
    }

    // Validate standard query translation format
    if (!translation.table || !translation.summary) {
      response.setStatus(500);
      response.setBody({
        error: 'Invalid translation format',
        details: 'Missing required fields: table or summary',
      });
      return;
    }

    // Return successful translation
    response.setStatus(200);
    response.setBody(translation);
  } catch (e) {
    gs.error('Error in query_translate API: ' + e.message);
    response.setStatus(500);
    response.setBody({
      error: 'Internal server error',
      details: e.message,
    });
  }
})(request, response);

/**
 * Extract JSON from text that may contain other content
 */
function extractJSON(text) {
  // Try to find JSON object in the text
  var jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return null;
}
