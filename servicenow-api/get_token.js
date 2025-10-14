/**
 * REST API Resource: Get Token
 * HTTP Method: GET
 * Relative Path: /get_token
 *
 * Returns the current user's session token for authenticating
 * subsequent API calls from the React frontend.
 *
 * Security: Does NOT require authentication (public endpoint)
 * This allows the app to fetch the session token for logged-in users.
 */

(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  response.setContentType('application/json');
  response.setBody({
    "sessionToken": gs.getSession().getSessionToken(),
    "username": gs.getUserName()
  });
})(request, response);
