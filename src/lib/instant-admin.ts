import { init } from "@instantdb/admin";
import schema, { type AppSchema } from "../../instant.schema";

export const INSTANT_APP_ID =
  process.env.INSTANT_APP_ID ||
  process.env.NEXT_PUBLIC_INSTANT_APP_ID ||
  "90e2cc71-9b7c-430e-87d3-cce5643cfb4b";

export const INSTANT_ADMIN_TOKEN =
  process.env.INSTANT_ADMIN_TOKEN || "ebfe59fb-6513-4094-80ab-fdee2772f34d";

export const INSTANT_API_URI =
  process.env.NEXT_PUBLIC_INSTANT_API_URI || "https://api.instantdb.uriv.me";

let _adminDb: ReturnType<typeof init<AppSchema>> | null = null;

export const getAdminDb = () => {
  if (!_adminDb) {
    _adminDb = init<AppSchema>({
      appId: INSTANT_APP_ID,
      adminToken: INSTANT_ADMIN_TOKEN,
      apiURI: INSTANT_API_URI,
      schema,
    });
  }
  return _adminDb;
};

export const adminDb = getAdminDb();
export { id } from "@instantdb/admin";
