"use client";

import { init } from "@instantdb/react";
import schema, { type AppSchema } from "../../instant.schema";

export const INSTANT_APP_ID =
  process.env.NEXT_PUBLIC_INSTANT_APP_ID || "90e2cc71-9b7c-430e-87d3-cce5643cfb4b";

export const INSTANT_API_URI =
  process.env.NEXT_PUBLIC_INSTANT_API_URI || "https://api.instantdb.uriv.me";

export const INSTANT_WS_URI =
  process.env.NEXT_PUBLIC_INSTANT_WS_URI || "wss://api.instantdb.uriv.me/runtime/session";

export const db = init<AppSchema>({
  appId: INSTANT_APP_ID,
  apiURI: INSTANT_API_URI,
  websocketURI: INSTANT_WS_URI,
  schema,
  devtool: false,
});

export const { useAuth, useQuery, transact, tx } = db;
export { id } from "@instantdb/react";
