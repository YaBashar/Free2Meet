/**
 * API client
 *
 * Owns the base URL, JSON transport, and error shape shared by every
 * Free2Meet request. Feature modules under `src/lib/api/` build on
 * `apiRequest`; screens should not call `fetch` directly.
 */

import Constants from "expo-constants";
import { NativeModules } from "react-native";

const FALLBACK_API_URL = "http://localhost:3229";

/**
 * Resolves where API calls should go.
 *
 * Expo `--tunnel` only publishes Metro, so development requests use the
 * packager origin and Metro proxies `/auth`, `/events`, `/attendees`, and
 * `/clear` to the backend. `EXPO_PUBLIC_API_URL` still wins when it points
 * at a reachable host; a LAN or localhost override is ignored during tunnel
 * sessions because the phone cannot use those addresses.
 */
export const API_BASE_URL = resolveApiBaseUrl();

/** Carries the backend's `{ error }` message alongside the HTTP status. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Status used when the request never reached the server. */
const NETWORK_FAILURE_STATUS = 0;

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  accessToken?: string;
};

/**
 * Sends a JSON request to the Free2Meet API and unwraps the response body.
 *
 * @param path Path appended to the base URL, for example `/auth/login`.
 * @param options HTTP method, JSON body, and optional bearer token.
 * @returns The parsed response body.
 * @throws ApiError when the request fails to send or returns a non-2xx status.
 */
export async function apiRequest<TResponse>(
  path: string,
  { method = "GET", body, accessToken }: RequestOptions = {},
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    // fetch only rejects on transport problems, so no status is available.
    throw new ApiError(
      "Could not reach Free2Meet. Check your connection and try again.",
      NETWORK_FAILURE_STATUS,
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(readErrorMessage(payload, response.status), response.status);
  }

  return payload as TResponse;
}

function resolveApiBaseUrl(): string {
  const packagerOrigin = originFromScriptUrl() ?? originFromHostUri(readHostUri());
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

  if (envUrl && !shouldIgnoreEnvUrl(envUrl, packagerOrigin)) {
    return envUrl;
  }

  return packagerOrigin ?? envUrl ?? FALLBACK_API_URL;
}

function originFromScriptUrl(): string | null {
  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  if (!scriptURL) {
    return null;
  }

  try {
    return new URL(scriptURL).origin;
  } catch {
    return null;
  }
}

function readHostUri(): string | undefined {
  const expoConfig = Constants.expoConfig as { hostUri?: string } | null;
  return expoConfig?.hostUri;
}

function originFromHostUri(hostUri: string | undefined): string | null {
  if (!hostUri) {
    return null;
  }

  try {
    const url = hostUri.includes("://") ? new URL(hostUri) : new URL(`http://${hostUri}`);
    const isTunnel = url.hostname.endsWith(".exp.direct") || url.hostname.includes("ngrok");
    const protocol = isTunnel ? "https" : "http";
    const defaultPort = protocol === "https" ? "443" : "80";

    if (!url.port || url.port === defaultPort) {
      return `${protocol}://${url.hostname}`;
    }

    return `${protocol}://${url.hostname}:${url.port}`;
  } catch {
    return null;
  }
}

function shouldIgnoreEnvUrl(envUrl: string, packagerOrigin: string | null): boolean {
  if (!packagerOrigin) {
    return false;
  }

  try {
    const packagerHost = new URL(packagerOrigin).hostname;
    if (!packagerHost.endsWith(".exp.direct") && !packagerHost.includes("ngrok")) {
      return false;
    }

    const envHost = new URL(envUrl).hostname;
    return envHost === "localhost" || envHost === "127.0.0.1" || isPrivateIpv4(envHost);
  } catch {
    return false;
  }
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = parts;
  return (
    first === 10 ||
    first === 127 ||
    (first === 192 && second === 168) ||
    (first === 172 && second >= 16 && second <= 31)
  );
}

/**
 * Reads the `{ error }` message the API error handler returns, falling back to
 * the status code when the body is missing or malformed.
 */
function readErrorMessage(payload: unknown, status: number): string {
  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const { error } = payload as { error: unknown };
    if (typeof error === "string" && error.length > 0) {
      return error;
    }
  }

  return `Request failed with status ${status}.`;
}
