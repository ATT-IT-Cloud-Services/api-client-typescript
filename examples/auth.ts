/**
 * Authentication example for @ignite/api-client
 *
 * Run: npx tsx examples/auth.ts
 */
import { ApiError, IgniteClient } from "../src/index.js";

const BASE_URL = process.env.IGNITE_API_URL ?? "https://api.example.test";

async function main() {
  const client = new IgniteClient({
    baseUrl: BASE_URL,
    clientKind: "api",
  });

  const email = process.env.IGNITE_EMAIL;
  const password = process.env.IGNITE_PASSWORD;

  if (!email || !password) {
    console.error("Set IGNITE_EMAIL and IGNITE_PASSWORD environment variables.");
    process.exit(1);
  }

  try {
    const login = await client.auth.login({
      email,
      password,
      rememberMe: true,
    });

    if (login.requiresTwoFactor) {
      console.log("Two-factor authentication required.");
      return;
    }

    if (login.token) {
      client.setToken(login.token);
    }

    const me = await client.auth.me();
    console.log("Authenticated user:", me.user.id, me.user.email);

    const sessions = await client.auth.sessions();
    console.log("Active sessions:", sessions.sessions.length);
  } catch (err) {
    if (err instanceof ApiError) {
      console.error("API error:", err.code, err.status);
    } else {
      throw err;
    }
  }
}

main();
