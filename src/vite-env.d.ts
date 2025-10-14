/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERVICENOW_INSTANCE: string;
  readonly VITE_SERVICENOW_USERNAME: string;
  readonly VITE_SERVICENOW_PASSWORD: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
