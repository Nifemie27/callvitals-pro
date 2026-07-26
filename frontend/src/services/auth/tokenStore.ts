/**
 * The access token lives only in memory, never localStorage/sessionStorage,
 * so it isn't readable by an XSS payload that persists across reloads. The
 * refresh token is an httpOnly cookie the browser handles automatically and
 * JS never touches. Losing the in-memory token on a hard reload is
 * expected and handled by AuthProvider's silent-refresh-on-load flow.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
