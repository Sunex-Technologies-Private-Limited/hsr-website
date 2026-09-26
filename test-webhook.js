import crypto from "crypto";
import http from "http";

// Parse arguments
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error("Usage: node test-webhook.js <razorpay_order_id>");
  console.log("Example: node test-webhook.js order_P1234567890abc");
  process.exit(1);
}

const orderId = args[0];

// The mock secret used in env.ts fallback
const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret";

const payload = {
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        order_id: orderId,
        status: "captured"
      }
    }
  }
};

const payloadString = JSON.stringify(payload);

// Generate valid signature
const signature = crypto
  .createHmac("sha256", secret)
  .update(payloadString)
  .digest("hex");

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/webhooks/razorpay',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-razorpay-signature': signature,
    'Content-Length': Buffer.byteLength(payloadString)
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${responseData}`);
    if (res.statusCode === 200) {
      console.log("✅ Webhook triggered successfully. Check your email inbox!");
    } else {
      console.error("❌ Webhook failed.");
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
  console.error(`Ensure your development server is running!`);
});

req.write(payloadString);
req.end();
