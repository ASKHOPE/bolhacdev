/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH0_DOMAIN: string;
  readonly VITE_AUTH0_CLIENT_ID: string;
  readonly VITE_AUTH0_CALLBACK_URL?: string;
  // readonly VITE_AUTH0_AUDIENCE?: string; // Uncomment if using audience
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Add other env variables here...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
