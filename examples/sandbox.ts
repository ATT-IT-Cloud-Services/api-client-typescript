/**
 * Sandbox mode example for @ignite/api-client
 *
 * Run: npx tsx examples/sandbox.ts
 */
import { ApiError, IgniteClient } from "../src/index.js";

const BASE_URL = process.env.IGNITE_API_URL ?? "https://api.example.test";

async function main() {
  // Sandbox mode needs no API key or session token.
  const client = new IgniteClient({
    baseUrl: BASE_URL,
    sandbox: true,
  });

  try {
    const list = await client.services.list(20);
    const items = list.services ?? list.servers ?? [];
    console.log("Sandbox services:", items.length, "placeholder data:", items[0] ?? null);
  } catch (err) {
    if (err instanceof ApiError) {
      console.error("API error:", err.code, err.status);
    } else {
      throw err;
    }
  }

  // Force a specific sandbox error to test error handling.
  const failing = new IgniteClient({
    baseUrl: BASE_URL,
    sandbox: true,
    sandboxError: "rate_limited",
    sandboxStatus: 429,
  });

  try {
    await failing.services.list();
    console.error("Expected a sandbox error, but the request succeeded.");
  } catch (err) {
    if (err instanceof ApiError) {
      console.log("Forced sandbox error:", err.code, err.status);
    } else {
      throw err;
    }
  }
}

main();
