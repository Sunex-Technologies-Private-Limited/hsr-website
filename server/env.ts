import "dotenv/config";
import { z } from "zod";
import { DEFAULT_PORT } from "./const";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().regex(/^\d+$/).default(DEFAULT_PORT.toString()),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL").optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
