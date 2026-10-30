import mongoose from "mongoose";
import { env } from "./config/env.js";

let connection: Promise<typeof mongoose> | undefined;

export function connectDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);

  if (!connection) {
    connection = mongoose.connect(env.MONGODB_URI, { maxPoolSize: 10 }).catch((error) => {
      connection = undefined;
      throw error;
    });
  }

  return connection;
}
