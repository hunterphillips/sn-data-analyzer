import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import axios from 'axios';
import './index.css';

function Container() {
  const [token, setToken] = useState('');

  useEffect(() => {
    if (token === '') {
      // Development mode: Use basic auth
      if (import.meta.env.MODE === 'development') {
        const username = import.meta.env.VITE_SERVICENOW_USERNAME;
        const password = import.meta.env.VITE_SERVICENOW_PASSWORD;

        if (username && password) {
          axios.defaults.auth = {
            username,
            password,
          };
          console.log('DEV MODE - Using basic auth for user:', username);
          setToken('dev-mode');
        } else {
          console.error('DEV MODE - Missing credentials in .env file');
          setToken('error');
        }
      } else {
        // Production mode: Fetch ServiceNow session token
        axios.get('/api/x_ipnll_data_ana_0/claude_ai/get_token')
          .then((r) => {
            const sessionToken = r.data.sessionToken;
            // Set token as default header for all axios requests
            axios.defaults.headers['X-userToken'] = sessionToken;
            console.log('PROD MODE - Received ServiceNow token:', sessionToken);
            setToken(sessionToken);
          })
          .catch((error) => {
            console.error('Error fetching session token:', error);
            // Still set token to allow app to render (will fail on API calls)
            setToken('error');
          });
      }
    }
  }, [token]);

  return (
    <>
      {token !== '' ? (
        <App />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading...
        </div>
      )}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Container />
  </StrictMode>
);
