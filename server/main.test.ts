import { describe, it, expect } from "vitest";
import { formatPrice } from "../client/src/lib/store";
import { appRouter } from "../server/routers";
import { webhooksRouter } from "../server/routes/webhooks";
import express from "express";
import request from "supertest";

// Mock TRPC Context for testing
const createMockContext = (role: string = "user") => ({
  req: {} as any,
  res: {} as any,
  user: { id: 1, email: "test@test.com", role } as any,
  auth: { user: { role } } as any
});

describe("HSR Digital Hub Core P0 Tests", () => {
  
  it("B12.5: formatPrice(19900) should return ₹199 with correct decimals", () => {
    const priceStr = formatPrice(19900);
    const cleanStr = priceStr.replace(/\s/g, '');
    expect(cleanStr).toMatch(/₹199(\.00)?/);
  });

  it("B12.1: non-admin cannot call admin.createProduct", async () => {
    const caller = appRouter.createCaller(createMockContext("user"));
    await expect(caller.admin.createProduct({
      slug: "test", name: "test", category: "test", type: "test", description: "test",
      price: 100, accent: "blue", imagePath: "test", coverLabel: "test", format: "test", included: "test", forWho: "test"
    })).rejects.toThrow(/You do not have required permission/);
  });

  it("B12.2: verifyPayment rejects bad signature", async () => {
    const caller = appRouter.createCaller(createMockContext("user"));
    await expect(caller.orders.verifyPayment({
      orderId: 1,
      razorpayOrderId: "order_mock",
      razorpayPaymentId: "pay_mock",
      razorpaySignature: "bad_signature"
    })).rejects.toThrow(/Invalid payment signature/);
  });

  it("B12.3: webhook POST without signature → 400", async () => {
    const testApp = express();
    testApp.use("/webhooks", webhooksRouter);
    const res = await request(testApp).post("/webhooks/razorpay").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Missing signature");
  });

  it("B12.4: download unpaid/missing token → 403/404", async () => {
    // Import db module and spy on getDb
    const dbModule = await import("../server/db");
    const spy = import("vitest").then(({ vi }) => {
      return vi.spyOn(dbModule, "getDb").mockResolvedValue({
        select: () => ({
          from: () => ({
            where: () => ({
              limit: () => []
            })
          })
        })
      } as any);
    });

    // Import the real app instance to test the actual route handler
    const { app } = await import("../server/index");
    
    // Using a missing/fake token against the real DB handler
    const res = await request(app).get("/api/downloads/missing_token_123");
    
    // Restore mock
    (await spy).mockRestore();

    // Should be 404 because token isn't in db
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Invalid or missing download token");
  });

});
