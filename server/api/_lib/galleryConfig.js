const MIN_CRYPTO_SECRET_LENGTH = 32;

export class GalleryConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "GalleryConfigurationError";
  }
}

export function getGalleryCodePepper() {
  return requireSecret("GALLERY_CODE_PEPPER");
}

export function getGallerySessionSecret() {
  return requireSecret("GALLERY_SESSION_SECRET");
}

export function getR2Config() {
  const endpoint = requireValue("R2_ENDPOINT");
  let endpointUrl;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    throw new GalleryConfigurationError("R2_ENDPOINT must be a valid URL.");
  }
  if (endpointUrl.protocol !== "https:") {
    throw new GalleryConfigurationError("R2_ENDPOINT must use HTTPS.");
  }

  const bucketName = requireValue("R2_BUCKET_NAME");
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucketName)) {
    throw new GalleryConfigurationError("R2_BUCKET_NAME is not a valid bucket name.");
  }

  return Object.freeze({
    accountId: requireValue("R2_ACCOUNT_ID"),
    accessKeyId: requireValue("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireValue("R2_SECRET_ACCESS_KEY"),
    bucketName,
    endpoint: endpointUrl.toString().replace(/\/$/, ""),
  });
}

function requireSecret(name) {
  const value = requireValue(name);
  if (value.length < MIN_CRYPTO_SECRET_LENGTH) {
    throw new GalleryConfigurationError(`${name} must contain at least ${MIN_CRYPTO_SECRET_LENGTH} characters.`);
  }
  return value;
}

function requireValue(name) {
  const value = process.env[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new GalleryConfigurationError(`${name} is required for gallery functionality.`);
  }
  return value.trim();
}
