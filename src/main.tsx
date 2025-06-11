import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin + '/callback'; // Default callback path

if (!domain || !clientId) {
  throw new Error('Auth0 domain and client ID must be set in .env');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        // audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Uncomment if you have an audience
      }}
      // scope="openid profile email your_custom_scope_for_roles" // Adjust scope if needed
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
