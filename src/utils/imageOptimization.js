const DEFAULTS = {
  maxWidth: 2000,
  previewWidth: 800,
  maxBytes: 1.5 * 1024 * 1024,
  initialQuality: 0.78,
  minQuality: 0.56,
};

function toJpgFileName(name) {
  const base = String(name || "lote").replace(/\.[^/.]+$/, "");
  return `${base}.jpg`;
}

function blobFromCanvas(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo generar el blob de imagen."));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo leer la imagen."));
    };
    image.src = objectUrl;
  });
}

function drawToCanvas(image, maxWidth) {
  const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

async function compressCanvas(canvas, { maxBytes, initialQuality, minQuality }) {
  let quality = initialQuality;
  let blob = await blobFromCanvas(canvas, quality);

  while (blob.size > maxBytes && quality > minQuality) {
    quality = Math.max(minQuality, quality - 0.06);
    blob = await blobFromCanvas(canvas, quality);
    if (quality === minQuality) break;
  }

  return blob;
}

export async function optimizeLotImage(file, options = {}) {
  const config = { ...DEFAULTS, ...options };
  const image = await loadImage(file);

  let mainCanvas = drawToCanvas(image, config.maxWidth);
  let optimizedBlob = await compressCanvas(mainCanvas, config);

  let safetyAttempts = 0;
  while (optimizedBlob.size > config.maxBytes && safetyAttempts < 3) {
    const reducedWidth = Math.max(1000, Math.round(mainCanvas.width * 0.9));
    mainCanvas = drawToCanvas(image, reducedWidth);
    optimizedBlob = await compressCanvas(mainCanvas, config);
    safetyAttempts += 1;
  }

  const previewCanvas = drawToCanvas(image, config.previewWidth);
  const previewBlob = await compressCanvas(previewCanvas, {
    ...config,
    maxBytes: 500 * 1024,
    initialQuality: 0.76,
    minQuality: 0.6,
  });

  const optimizedName = toJpgFileName(file.name);
  const optimizedFile = new File([optimizedBlob], optimizedName, { type: "image/jpeg" });
  const previewFile = new File([previewBlob], `preview-${optimizedName}`, { type: "image/jpeg" });

  return {
    optimizedFile,
    previewFile,
    meta: {
      originalBytes: file.size,
      optimizedBytes: optimizedBlob.size,
      previewBytes: previewBlob.size,
      width: mainCanvas.width,
      height: mainCanvas.height,
    },
  };
}

export function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(0)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

