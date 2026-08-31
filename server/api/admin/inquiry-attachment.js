import { GetObjectCommand } from "@aws-sdk/client-s3";
import { ObjectId } from "mongodb";
import { requireAdmin } from "../_lib/auth.js";
import { getDb } from "../_lib/db.js";
import { createR2PresignedUrl, getR2BucketName } from "../_lib/r2.js";
import { cleanText, json } from "../_lib/http.js";

export default async function handler(req, res) {
  const admin = await requireAdmin(req, res); if (!admin) return;
  if (req.method !== "GET") return json(res, 405, { success: false, message: "Method not allowed." });
  const id = cleanText(req.query?.id, 50), index = Number(req.query?.index);
  if (!ObjectId.isValid(id) || !Number.isInteger(index) || index < 0) return json(res, 400, { success: false, message: "Invalid attachment request." });
  const inquiry = await (await getDb()).collection("inquiries").findOne({ _id: new ObjectId(id) }, { projection: { attachments: 1 } });
  const attachment = inquiry?.attachments?.[index];
  if (!attachment?.key?.startsWith("inquiries/pending/")) return json(res, 404, { success: false, message: "Attachment not found." });
  const url = await createR2PresignedUrl(new GetObjectCommand({ Bucket: getR2BucketName(), Key: attachment.key, ResponseContentDisposition: 'attachment; filename="' + String(attachment.name).replaceAll('"', "") + '"' }), 120);
  return json(res, 200, { success: true, url });
}
