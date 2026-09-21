const DEV_FALLBACK = 'http://localhost:8000';

function stripTrailingSlashes(url: string): string {
  return url.replace(/\/+$/, '');
}

function readApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  return stripTrailingSlashes(raw || DEV_FALLBACK);
}

const apiUrl = readApiUrl();

export const env = {
  apiUrl,
  wsUrl: apiUrl.replace(/^http/, 'ws'),
} as const;
