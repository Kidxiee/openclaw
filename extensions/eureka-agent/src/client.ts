/**
 * HTTP client wrapping the s-core-eureka backend API.
 * Mirrors EurekaMCPClient from the Python codebase.
 */

const BASE_URL =
  process.env["EUREKA_API_BASE_URL"] ??
  "http://qa-s-core-eureka.patsnap.info/eureka/agent/tech-graph";
const TIMEOUT_MS = 60_000;

export type EurekaCallParams = Record<string, unknown>;

export async function callEureka(
  endpoint: string,
  params: EurekaCallParams,
  siteLang = "CN",
  signal?: AbortSignal,
): Promise<unknown> {
  const url = `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const combinedSignal = signal ?? controller.signal;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-patsnap-from": "s-core-eureka-agent",
        "x-site-lang": siteLang,
      },
      body: JSON.stringify(params),
      signal: combinedSignal,
    });

    if (!res.ok) {
      throw new Error(`Eureka API error ${res.status}: ${await res.text()}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}
