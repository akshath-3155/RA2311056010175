/**
 * tokenManager.ts — Automatic Token Refresh
 *
 * Calls POST /evaluation-service/auth with clientID + clientSecret
 * to get a fresh Bearer token whenever the cached one is missing or expired.
 *
 * Token endpoint: POST http://20.207.122.201/evaluation-service/auth
 * Body: { email, name, rollNo, accessCode, clientID, clientSecret }
 */

import axios from 'axios';

const AUTH_ENDPOINT = 'http://20.207.122.201/evaluation-service/auth';

interface TokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number; // Unix timestamp (seconds) when token expires
}

// In-memory cache
let cachedToken: string | null = import.meta.env.VITE_ACCESS_TOKEN || null;
let tokenExpiresAt: number = 0; // epoch seconds

/** Return true if the cached token is still valid (with 60s safety margin) */
function isTokenValid(): boolean {
  if (!cachedToken) return false;
  if (tokenExpiresAt === 0) return true; // trust the env token until we know
  return Date.now() / 1000 < tokenExpiresAt - 60;
}

/**
 * Fetch a fresh token from the auth endpoint.
 * Caches it in memory so subsequent calls reuse it until expiry.
 */
export async function getToken(): Promise<string> {
  if (isTokenValid() && cachedToken) return cachedToken;

  console.info('[tokenManager] Refreshing access token...');

  const response = await axios.post<TokenResponse>(
    AUTH_ENDPOINT,
    {
      email: 'akshath.creates@gmail.com',
      name: 'Akshath Senthilkumar',
      rollNo: 'RA231105610175',
      accessCode: 'QkbpxH',
      clientID: import.meta.env.VITE_CLIENT_ID,
      clientSecret: import.meta.env.VITE_CLIENT_SECRET,
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 },
  );

  cachedToken = response.data.access_token;
  tokenExpiresAt = response.data.expires_in; // server returns Unix timestamp
  console.info('[tokenManager] Token refreshed, expires at:', new Date(tokenExpiresAt * 1000).toISOString());

  return cachedToken;
}
