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
export const DATABASE_INDEXES = Object.freeze([
  ["admins", { email: 1 }, { unique: true }],
  ["projects", { slug: 1 }, { unique: true }],
  ["services", { slug: 1 }, { unique: true }],
  ["services", { active: 1, sortOrder: 1 }],
  ["testimonials", { public: 1, sortOrder: 1 }],
  ["site_content", { key: 1 }, { unique: true }],
  ["site_content_history", { page: 1, createdAt: -1 }],
  ["site_media", { status: 1, createdAt: -1 }],
  ["inquiries", { createdAt: -1 }],
  ["customers", { email: 1 }, { sparse: true }],
  ["bookings", { startAt: 1 }],
  ["login_attempts", { expiresAt: 1 }, { expireAfterSeconds: 0 }],
  ["gallery_events", { codeHash: 1 }, { unique: true }],
  ["gallery_events", { published: 1, archivedAt: 1, expiresAt: 1 }],
  ["gallery_photos", { eventId: 1, status: 1, sortOrder: 1 }],
  ["gallery_photos", { eventId: 1, _id: 1 }],
  ["gallery_photos", { eventId: 1, clientUploadId: 1 }, { unique: true, sparse: true }],
  ["gallery_videos", { objectKey: 1 }, { unique: true }],
  ["gallery_videos", { eventId: 1 }, { unique: true, partialFilterExpression: { status: "pending" } }],
  ["gallery_videos", { eventId: 1, status: 1, createdAt: -1 }],
  ["gallery_code_attempts", { identifierHash: 1 }, { unique: true }],
  ["gallery_code_attempts", { expiresAt: 1 }, { expireAfterSeconds: 0 }],
]);

export async function ensureIndexes(db) {
  if (indexesReady) return;
  await Promise.all(DATABASE_INDEXES.map(([collection, keys, options]) => (
    db.collection(collection).createIndex(keys, options)
  )));
  indexesReady = true;
}
