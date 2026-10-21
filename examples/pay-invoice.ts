/**
 * Pay invoice example for @ignite/api-client
 *
 * Run: npx tsx examples/pay-invoice.ts
 */
import { ApiError, IgniteClient } from "../src/index.js";

const BASE_URL = process.env.IGNITE_API_URL ?? "https://api.example.test";
const TOKEN = process.env.IGNITE_TOKEN;
const INVOICE_ID = process.env.IGNITE_INVOICE_ID;

async function main() {
  if (!TOKEN || !INVOICE_ID) {
    console.error("Set IGNITE_TOKEN and IGNITE_INVOICE_ID environment variables.");
    process.exit(1);
  }

  const client = new IgniteClient({
    baseUrl: BASE_URL,
    token: TOKEN,
    clientKind: "desktop",
  });

  try {
    const detail = await client.billing.invoice(INVOICE_ID);
    console.log("Invoice:", detail.invoice.id, detail.invoice.status, detail.invoice.total);

    const methods = await client.billing.paymentMethods();
    console.log("Saved payment methods:", methods.methods.length);

    const result = await client.billing.payInvoice(INVOICE_ID, {
      paymentMethod: methods.methods[0] ? "mollie_saved" : "mollie",
      savedMandateId: methods.defaultMandateId ?? undefined,
    });

    if (result.checkoutUrl) {
      console.log("Redirect to payment:", result.checkoutUrl);
    } else if (result.alreadyPaid) {
      console.log("Invoice already paid.");
    } else {
      console.log("Payment initiated:", result.paymentId ?? "processing");
    }
  } catch (err) {
    if (err instanceof ApiError) {
      console.error("API error:", err.code, err.status);
      if (err.code === "insufficientBalance") {
        console.error("Top up wallet balance or choose a different payment method.");
      }
    } else {
      throw err;
    }
  }
}

main();
