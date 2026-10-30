import dotenv from "dotenv";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import { z } from "zod";

dotenv.config({path:resolve(dirname(fileURLToPath(import.meta.url)),"../../../.env")});

const schema=z.object({NODE_ENV:z.enum(["development","test","production"]).default("development"),PORT:z.coerce.number().int().positive().default(5000),CLIENT_ORIGIN:z.string().url().default("http://localhost:5173"),MONGODB_URI:z.string().default("mongodb://127.0.0.1:27017/ai_mystery_room"),GEMINI_API_KEY:z.string().optional(),GEMINI_MODEL:z.string().default("gemini-3.5-flash-lite"),GEMINI_TIMEOUT_MS:z.coerce.number().default(60000),AI_MAX_RETRIES:z.coerce.number().int().min(0).max(3).default(2),AI_MAX_OUTPUT_TOKENS:z.coerce.number().int().positive().default(8192),RATE_LIMIT_WINDOW_MS:z.coerce.number().default(60000),RATE_LIMIT_MAX_REQUESTS:z.coerce.number().default(10),SESSION_SECRET:z.string().min(32).optional()});
export const env=schema.parse(process.env);
