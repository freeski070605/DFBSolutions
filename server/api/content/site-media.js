import { ObjectId } from "mongodb";
import { pipeline } from "node:stream/promises";
import { getDb } from "../_lib/db.js";
import { getR2BucketName, getR2Client, GetObjectCommand } from "../_lib/r2.js";
import { json } from "../_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { success: false, message: "Method not allowed." });
  const id = String(req.query?.id || "");
  if (!/^[a-f0-9]{24}$/i.test(id)) return json(res, 404, { success: false, message: "Image not found." });
  const item = await (await getDb()).collection("site_media").findOne({ _id: new ObjectId(id), status: "ready" });
  if (!item) return json(res, 404, { success: false, message: "Image not found." });
  const object = await getR2Client().send(new GetObjectCommand({ Bucket: getR2BucketName(), Key: item.objectKey }));
  res.setHeader("Content-Type", item.mimeType);
  res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400");
  if (item.fileSize) res.setHeader("Content-Length", item.fileSize);
  await pipeline(object.Body, res);
}
