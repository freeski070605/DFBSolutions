export const GALLERY_ACCEPTED_IMAGE_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp"]);
export const GALLERY_MAX_ORIGINAL_BYTES = 100 * 1024 * 1024;
export const GALLERY_UPLOAD_CONCURRENCY = 3;

export function validateSelectedGalleryFiles(fileList) {
  const accepted = [];
  const errors = [];
  for (const file of Array.from(fileList || [])) {
    if (!GALLERY_ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      errors.push(`${file.name}: HEIC, RAW, and other unsupported files must be exported as JPEG, PNG, or WebP.`);
    } else if (!file.size) {
      errors.push(`${file.name}: the file is empty.`);
    } else if (file.size > GALLERY_MAX_ORIGINAL_BYTES) {
      errors.push(`${file.name}: originals must be 100 MB or smaller.`);
    } else {
      accepted.push(file);
    }
  }
  return { accepted, errors, totalBytes: accepted.reduce((total, file) => total + file.size, 0) };
}

export async function processGalleryImage(file) {
  const source = await decodeImage(file);
  try {
    const width = source.width;
    const height = source.height;
    if (!width || !height) throw new Error("The browser could not determine this photo's dimensions.");
    const web = await renderJpeg(source.drawable, width, height, 2400, 0.86);
    const thumb = await renderJpeg(source.drawable, width, height, 600, 0.78);
    return { original: file, web, thumb, width, height };
  } finally {
    source.release();
  }
}

export async function runWithConcurrency(items, worker, concurrency = GALLERY_UPLOAD_CONCURRENCY) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(Math.max(1, concurrency), queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

export function formatFileSize(bytes) {
  const value = Number(bytes) || 0;
  if (value >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(1)} GB`;
  if (value >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}

async function decodeImage(file) {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { drawable: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
    } catch {
      // Fall through to the broadly supported HTMLImageElement decoder.
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = "async";
    image.src = url;
    await image.decode();
    return { drawable: image, width: image.naturalWidth, height: image.naturalHeight, release: () => URL.revokeObjectURL(url) };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw new Error("This image could not be decoded. Export it as a standard JPEG, PNG, or WebP and try again.", { cause: error });
  }
}

async function renderJpeg(drawable, width, height, maxEdge, quality) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) throw new Error("This browser cannot prepare gallery images.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, targetWidth, targetHeight);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(drawable, 0, 0, targetWidth, targetHeight);
  const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("JPEG generation failed.")), "image/jpeg", quality));
  canvas.width = 1;
  canvas.height = 1;
  return blob;
}
