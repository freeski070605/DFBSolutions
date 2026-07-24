import { MongoClient, ServerApiVersion } from "mongodb";

const globalCache = globalThis.__dfbMongo || (globalThis.__dfbMongo = { client: null, promise: null });

export async function getDb() {
  const uri = process.env.MONGODB_URI || process.env.mongo_uri;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  if (!globalCache.promise) {
    globalCache.client = new MongoClient(uri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      appName: "dfb-solutions-crm",
    });
    globalCache.promise = globalCache.client.connect().catch((error) => {
      globalCache.promise = null;
      globalCache.client = null;
      throw error;
    });
  }

  const client = await globalCache.promise;
  const db = client.db(process.env.MONGODB_DB || "dfb_solutions");
  await ensureIndexes(db);
  return db;
}

let indexesReady = false;
async function ensureIndexes(db) {
  if (indexesReady) return;
  await Promise.all([
    db.collection("admins").createIndex({ email: 1 }, { unique: true }),
    db.collection("projects").createIndex({ slug: 1 }, { unique: true }),
    db.collection("inquiries").createIndex({ createdAt: -1 }),
    db.collection("customers").createIndex({ email: 1 }, { sparse: true }),
    db.collection("bookings").createIndex({ startAt: 1 }),
    db.collection("login_attempts").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
  indexesReady = true;
}
