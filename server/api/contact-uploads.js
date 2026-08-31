import { PutObjectCommand } from "@aws-sdk/client-s3";
import { createInquiryObjectKey, signInquiryUpload, validateInquiryFile } from "./_lib/inquiryUploads.js";
import { createR2PresignedUrl, getR2BucketName } from "./_lib/r2.js";
import { allowedOrigin, json, parseBody } from "./_lib/http.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { success: false, message: "Method not allowed." });
  if (!allowedOrigin(req)) return json(res, 403, { success: false, message: "Origin not allowed." });
  const file = validateInquiryFile(parseBody(req));
  if (!file) return json(res, 400, { success: false, message: "Unsupported file or file larger than 10 MB." });
  const key = createInquiryObjectKey(file.extension);
  const uploadUrl = await createR2PresignedUrl(new PutObjectCommand({ Bucket: getR2BucketName(), Key: key, ContentType: file.contentType, ContentLength: file.size, Metadata: { purpose: "private-inquiry" } }), 300);
  return json(res, 200, { success: true, uploadUrl, contentType: file.contentType, token: signInquiryUpload({ key, name: file.name, type: file.contentType, size: file.size }) });
}
