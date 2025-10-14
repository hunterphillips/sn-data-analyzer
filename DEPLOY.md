# Deploy to ServiceNow

Quick guide to deploy this React app to ServiceNow.

## Prerequisites

- ServiceNow instance with admin access
- Anthropic API key
- Node.js 18+ installed

## Local Development (Optional)

If you want to run the app locally before deploying:

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your credentials:**
   ```bash
   VITE_SERVICENOW_INSTANCE=https://your-instance.service-now.com
   VITE_SERVICENOW_USERNAME=your.username
   VITE_SERVICENOW_PASSWORD=your_password
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Access at:** `http://localhost:5173`

**Note**: The dev server uses basic auth to connect to ServiceNow APIs. Never commit your `.env` file!

## Deployment Steps

### 1. Build App (5 min)

```bash
cd servicenow-widget
npm install
npm run build
```

Output: `dist/index.html` (single file with inlined JS/CSS)

### 2. Configure API Key (2 min)

In ServiceNow:
1. Go to **sys_properties.list**
2. Click **New**
3. Set:
   - Name: `anthropic.api.key`
   - Value: `sk-ant-api03-...`
4. Submit

### 3. Create Script Includes (10 min)

Create 3 Script Includes from `../servicenow-api/script-includes/`:

**A. ClaudeConfig:**
1. Go to **System Definition** → **Script Includes**
2. Click **New**:
   - Name: `ClaudeConfig`
   - API Name: `ClaudeConfig`
   - Accessible from: `All application scopes`
   - Script: Paste from `ClaudeConfig.js`
3. Submit

**B. ClaudeAPIClient:**
1. Click **New**:
   - Name: `ClaudeAPIClient`
   - API Name: `ClaudeAPIClient`
   - Accessible from: `All application scopes`
   - Script: Paste from `ClaudeAPIClient.js`
2. Submit

**C. MessageProcessor:**
1. Click **New**:
   - Name: `MessageProcessor`
   - API Name: `MessageProcessor`
   - Accessible from: `All application scopes`
   - Script: Paste from `MessageProcessor.js`
2. Submit

### 4. Create Backend REST APIs (10 min)

1. Go to **System Web Services** → **Scripted REST APIs**
2. Click **New**:
   - Name: `Claude AI Integration`
   - API ID: `claude_ai`
   - Namespace: (your scope, e.g., `x_ipnll_data_ana_0`)
3. Submit

**Create 2 Resources:**

**A. Get Token Endpoint:**
- Click **New** under Resources:
  - Name: `Get Token`
  - HTTP Method: `GET`
  - Relative Path: `/get_token`
  - Script:
```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  response.setContentType('application/json');
  response.setBody({
    "sessionToken": gs.getSession().getSessionToken(),
    "username": gs.getUserName()
  });
})(request, response);
```
  - **Security**: Requires authentication: `No` (UNCHECK - allows app to fetch token)
- Submit

**B. Analyze Endpoint:**
- Click **New** under Resources:
  - Name: `Analyze`
  - HTTP Method: `POST`
  - Relative Path: `/analyze`
  - Script: Paste from `../servicenow-api/claude_analyze.js`
  - **Security**: Requires authentication: `Yes` (keep checked)
- Submit

### 5. Host React App (3 min)

**A. Create System Property:**
1. Go to **sys_properties.list**
2. Click **New**:
   - Name: `sn.data.analyst.html`
   - Type: `string`
   - Value: Copy entire contents of `dist/index.html`
3. Submit

**B. Create Frontend REST API:**
1. Go to **System Web Services** → **Scripted REST APIs**
2. Find `Claude AI Integration` (or create new API)
3. Click **New** under Resources:
   - Name: `App Frontend`
   - HTTP Method: `GET`
   - Relative Path: `/app`
   - Script:
```javascript
(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
  var html = gs.getProperty('sn.data.analyst.html');
  response.setContentType('text/html');
  response.setStatus(200);
  response.getStreamWriter().writeString(html);
})(request, response);
```
4. **Security**: Requires authentication: `No` (uncheck)
5. Submit

### 6. Access the App (1 min)

Navigate to: `https://YOUR_INSTANCE.service-now.com/api/x_YOUR_SCOPE/claude_ai/app`

Example: `https://ven05595.service-now.com/api/x_ipnll_data_ana_0/claude_ai/app`

**Authentication Flow:**
1. User navigates to `/app` endpoint (no auth required - public access)
2. App loads and calls `/get_token` (no auth) to retrieve session token
3. Token is set as default header (`X-userToken`) for all axios requests
4. All subsequent API calls (like `/analyze`) automatically include the token

**Note**: The app uses axios with default headers to automatically include the session token in all requests. This enables both Claude API calls and future ServiceNow API integrations.

## Test

1. Navigate to the app URL
2. Upload a CSV/JSON with ServiceNow data
3. Ask: "Show me incidents by priority"

## Troubleshooting

**App doesn't load:**
- Check system property `sn.data.analyst.html` has HTML content
- Verify GET endpoint authentication is disabled
- Check browser console for errors

**API errors:**
- Verify API key in `anthropic.api.key` system property
- Check ServiceNow logs: **System Logs** → **Application Logs**
- Test backend API: **System Web Services** → **REST API Explorer**
- Ensure Script Includes are accessible from all scopes

**Updating app:**
1. Rebuild: `npm run build`
2. Update `sn.data.analyst.html` system property with new `dist/index.html`
3. Clear browser cache or test in incognito window

## What's Included

- Chat interface for data analysis
- File upload (CSV, JSON, text files)
- AI-powered insights with Claude
- Chart generation (ready to add from main app)

## Next Steps

- Copy chart components from `/app/servicenow/page.tsx`
- Add model selection dropdown
- Implement file preview
- Add chart pagination
