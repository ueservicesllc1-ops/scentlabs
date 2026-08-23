import { logger } from "../logger";

const SHIPPO_API_BASE = "https://api.goshippo.com";

export async function shippoFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.SHIPPO_API_KEY;

  if (!apiKey) {
    logger.warn("[SHIPPO] SHIPPO_API_KEY environment variable is not configured.");
    throw new Error("SHIPPO_API_KEY_NOT_CONFIGURED");
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${SHIPPO_API_BASE}${cleanEndpoint}`;

  const headers = {
    Authorization: `ShippoToken ${apiKey.trim()}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`[SHIPPO API ERROR] ${response.status} ${response.statusText}`, {
        endpoint,
        error: errorBody,
      });
      throw new Error(`Shippo API returned HTTP ${response.status}: ${errorBody}`);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    if (error.message === "SHIPPO_API_KEY_NOT_CONFIGURED") {
      throw error;
    }
    logger.error(`[SHIPPO CLIENT EXCEPTION] ${endpoint}`, error);
    throw error;
  }
}
