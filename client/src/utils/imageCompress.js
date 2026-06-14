export async function compressImageFile(file, maxSize = 512, quality = 0.88) {
  if (!file || !file.type?.startsWith('image/')) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}

/** Compress a data-URL image for faster vision/OCR uploads */
export async function compressDataUrl(dataUrl, maxSize = 768, quality = 0.82) {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) return dataUrl;
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], 'upload.jpg', { type: blob.type || 'image/jpeg' });
  const compressed = await compressImageFile(file, maxSize, quality);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(compressed);
  });
}
