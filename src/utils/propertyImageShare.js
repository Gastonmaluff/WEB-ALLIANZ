function safeFileName(value) {
  return String(value || "propiedad")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function buildImageCandidates(url) {
  const source = String(url || "").trim();
  if (!source) return [];
  const candidates = [source];

  if (/^https?:\/\//i.test(source) && !/images\.weserv\.nl/i.test(source)) {
    candidates.push(`https://images.weserv.nl/?url=${encodeURIComponent(source)}`);
  }

  return [...new Set(candidates)];
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fetchBlobViaXhr(url) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "blob";
    request.onload = () => {
      if (request.status >= 200 && request.status < 300 && request.response) {
        resolve(request.response);
      } else {
        reject(new Error(`HTTP ${request.status}`));
      }
    };
    request.onerror = () => reject(new Error("XHR failed"));
    request.send();
  });
}

function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function hexToRgba(hexColor, alpha = 1) {
  const clean = String(hexColor || "")
    .replace("#", "")
    .trim();
  const normalized = clean.length === 3 ? clean.split("").map((c) => `${c}${c}`).join("") : clean;
  if (normalized.length !== 6) return `rgba(80, 190, 255, ${alpha})`;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function imageUrlToCanvasDataUrl(url) {
  if (!url || typeof window === "undefined") return null;
  try {
    const image = await loadImageElement(url);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || 1200;
    canvas.height = image.naturalHeight || 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return null;
  }
}

async function fetchAsDataUrl(url) {
  if (!url) return null;
  if (String(url).startsWith("data:image/")) return url;
  const candidates = buildImageCandidates(url);

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { mode: "cors", cache: "no-store" });
      if (response.ok) {
        const blob = await response.blob();
        const result = await blobToDataUrl(blob);
        if (result) return result;
      }
    } catch {
      // try next strategy
    }

    try {
      const blob = await fetchBlobViaXhr(candidate);
      const result = await blobToDataUrl(blob);
      if (result) return result;
    } catch {
      // try canvas fallback
    }

    const canvasResult = await imageUrlToCanvasDataUrl(candidate);
    if (canvasResult) return canvasResult;
  }

  return null;
}

export function dataUrlToBlob(dataUrl) {
  const [header, body] = String(dataUrl || "").split(",");
  if (!header || !body) return null;
  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "image/jpeg";
  const binary = atob(body);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    buffer[i] = binary.charCodeAt(i);
  }
  return new Blob([buffer], { type: mimeType });
}

export function buildShareImageFileName(property) {
  return `${safeFileName(property?.titulo || property?.slug || "propiedad")}-principal.jpg`;
}

export function downloadDataUrl(dataUrl, fileName) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function createLotOverlayImage(property) {
  const lotOverlay = property?.lotOverlay || property?.loteDelimitacion;
  const points = Array.isArray(lotOverlay?.points) ? lotOverlay.points : [];
  const hasOverlay = Boolean(lotOverlay?.enabled !== false && lotOverlay?.imageUrl && points.length > 2);
  if (!hasOverlay) return null;

  const imageDataUrl = await fetchAsDataUrl(lotOverlay.imageUrl);
  if (!imageDataUrl) return null;

  try {
    const image = await loadImageElement(imageDataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || 1600;
    canvas.height = image.naturalHeight || 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return imageDataUrl;

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    points.forEach((point, index) => {
      const x = (Number(point?.x || 0) / 100) * canvas.width;
      const y = (Number(point?.y || 0) / 100) * canvas.height;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    const fillColor = lotOverlay?.fillColor || "#50BEFF";
    const fillOpacity = Number.isFinite(Number(lotOverlay?.fillOpacity))
      ? Number(lotOverlay.fillOpacity)
      : 0.18;
    const strokeColor = lotOverlay?.strokeColor || "#7DD3FC";
    const strokeWidth = Number.isFinite(Number(lotOverlay?.strokeWidth))
      ? Number(lotOverlay.strokeWidth)
      : 1.2;

    ctx.fillStyle = hexToRgba(fillColor, Math.max(0.08, Math.min(0.45, fillOpacity)));
    ctx.strokeStyle = strokeColor;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = Math.max(2.2, strokeWidth * 3.5);
    ctx.fill();
    ctx.stroke();

    return canvas.toDataURL("image/jpeg", 0.9);
  } catch {
    return imageDataUrl;
  }
}

export async function getPropertyPrimaryImageDataUrl(property) {
  const overlayDataUrl = await createLotOverlayImage(property);
  if (overlayDataUrl) return overlayDataUrl;
  return fetchAsDataUrl(property?.imagenPrincipal || "");
}

