export function uploadToPresignedUrl(url, blob, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", url, true);
    request.setRequestHeader("Content-Type", contentType);
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded, event.total);
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else reject(new Error(`Direct upload failed with status ${request.status || "unknown"}.`));
    });
    request.addEventListener("error", () => reject(new Error("Direct upload could not reach private storage. Check the R2 CORS configuration and try again.")));
    request.addEventListener("abort", () => reject(new Error("Upload was interrupted.")));
    request.send(blob);
  });
}
