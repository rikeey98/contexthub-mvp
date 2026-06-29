import type { ContextHubApi } from "./types";

declare global {
  interface Window {
    contextHub: ContextHubApi;
  }
}

export const api = window.contextHub;
