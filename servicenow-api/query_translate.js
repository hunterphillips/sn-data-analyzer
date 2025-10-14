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

    // Build system prompt with schema context
    var systemPrompt = buildTranslationSystemPrompt(schema);

    // Build user message with table hint if provided
    var userMessage = naturalLanguage;
    if (tableHint) {
      userMessage = 'Table hint: ' + tableHint + '\n\nQuery: ' + naturalLanguage;
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
 * Build system prompt for query translation
 */
function buildTranslationSystemPrompt(schema) {
  return `You are a ServiceNow query translation assistant. Your job is to translate natural language requests into structured ServiceNow Table API query parameters.

## Available Tables and Fields

${schema}

## ServiceNow Encoded Query Syntax

Use these operators to build encoded queries:
- = (equals): field=value
- != (not equals): field!=value
- > (greater than): field>value
- < (less than): field<value
- >= (greater or equal): field>=value
- <= (less or equal): field<=value
- ^ (AND): condition1^condition2
- ^OR (OR): condition1^ORcondition2
- LIKE (contains): fieldLIKEvalue
- STARTSWITH: fieldSTARTSWITHvalue
- ENDSWITH: fieldENDSWITHvalue

For boolean fields:
- active=true (for true)
- active=false (for false)

For reference fields (assignment_group, assigned_to, etc.):
- Use field= for "is empty" or "unassigned"
- Use field!= for "is not empty" or "assigned"

For date fields:
- Use javascript:gs.daysAgoStart(7) for "last 7 days"
- Use javascript:gs.daysAgoEnd(7) for "before 7 days ago"

## Examples

User: "Show me all critical priority incidents that are still open"
Output:
{
  "table": "incident",
  "tableLabel": "Incident",
  "encodedQuery": "priority=1^active=true",
  "fields": ["number", "short_description", "priority", "state", "assigned_to", "opened_at"],
  "limit": 100,
  "displayValue": "true",
  "summary": "Searching Incidents where priority is Critical (1) and active is true"
}

User: "Get pending change requests with high risk"
Output:
{
  "table": "change_request",
  "tableLabel": "Change Request",
  "encodedQuery": "state=-5^ORstate=-4^risk=1",
  "fields": ["number", "short_description", "state", "risk", "priority", "start_date"],
  "limit": 100,
  "displayValue": "true",
  "summary": "Searching Change Requests where state is New (-5) or Assess (-4) and risk is High (1)"
}

User: "Find unassigned problems from the last 7 days"
Output:
{
  "table": "problem",
  "tableLabel": "Problem",
  "encodedQuery": "assignment_group=^sys_created_on>=javascript:gs.daysAgoStart(7)",
  "fields": ["number", "short_description", "priority", "state", "sys_created_on"],
  "limit": 100,
  "displayValue": "true",
  "summary": "Searching Problems where assignment group is empty and created within the last 7 days"
}

## Instructions

1. Analyze the user's natural language request
2. Determine the most appropriate table (use table hint if provided, but can override if user is explicit)
3. Identify the fields/conditions mentioned
4. Build the encoded query using proper ServiceNow syntax
5. Select relevant fields to return (include key identifying fields + fields mentioned in query)
6. Create a human-readable summary of what the query will search for
7. Return ONLY valid JSON matching this exact format:

{
  "table": "table_name",
  "tableLabel": "Human Readable Table Name",
  "encodedQuery": "field1=value1^field2=value2",
  "fields": ["field1", "field2", "field3"],
  "limit": 100,
  "displayValue": "true",
  "summary": "Human readable description of what this query searches for"
}

IMPORTANT:
- Always return valid JSON only
- Use actual field names from the schema (not labels)
- Use actual choice values (numbers) not labels
- If encodedQuery is empty string, it means "get all records"
- Always include key identifier fields like "number" and "short_description"
- Limit should typically be 100 unless user specifies otherwise
- DisplayValue should be "true" for human-readable results`;
}

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
