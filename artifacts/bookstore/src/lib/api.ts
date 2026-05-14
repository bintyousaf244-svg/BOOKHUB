import { setBaseUrl } from "@workspace/api-client-react";

const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim();

export const apiBaseUrl = rawApiBaseUrl
  ? rawApiBaseUrl.replace(/\/+$/, "")
  : null;

setBaseUrl(apiBaseUrl);

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(`API paths must start with "/": ${path}`);
  }

  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

export function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(apiUrl(path), init);
}

export function storageUrl(objectPath: string): string {
  return apiUrl(`/api/storage${objectPath}`);
}
