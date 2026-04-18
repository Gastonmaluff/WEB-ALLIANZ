import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { formatCurrency, formatOperationLabel, toTitle } from "./format";

const CONTACT_PHONE = "+595 981 000000";
const CONTACT_EMAIL = "hola@allianzbienesraices.com";
const CONTACT_CITY = "Asuncion, Paraguay";

function absoluteUrl(pathname) {
  if (typeof window === "undefined") return pathname;
  const basePath = import.meta.env.BASE_URL || "/";
  const normalizedBase = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const sanitized = pathname.startsWith("/") ? pathname.slice(1) : pathname;
  return new URL(`${normalizedBase}${sanitized}`, window.location.origin).toString();
}

function safeFileName(value) {
  return String(value || "ficha-propiedad")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function buildImageCandidates(url) {
  const source = String(url || "").trim();
  if (!source) return [];
  const candidates = [source];

  try {
    const parsed = new URL(source);
    const decodedPath = parsed.pathname.includes("/o/")
      ? decodeURIComponent(parsed.pathname.split("/o/")[1] || "")
      : "";
    if (
      parsed.hostname === "firebasestorage.googleapis.com" &&
      decodedPath &&
      parsed.pathname.includes("/v0/b/")
    ) {
      const bucket = parsed.pathname.split("/v0/b/")[1]?.split("/o/")[0];
      if (bucket) {
        candidates.push(`https://storage.googleapis.com/${bucket}/${decodedPath}`);
      }
    }
  } catch {
    // ignore parsing errors
  }

  if (/^https?:\/\//i.test(source) && !/images\.weserv\.nl/i.test(source)) {
    candidates.push(`https://images.weserv.nl/?url=${encodeURIComponent(source)}`);
  }

  return [...new Set(candidates)];
}

async function fetchBlobViaXhr(url) {
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

async function loadImageElement(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function hexToRgb(hexColor, fallback = { r: 234, g: 242, b: 250 }) {
  const clean = String(hexColor || "")
    .replace("#", "")
    .trim();
  const normalized = clean.length === 3 ? clean.split("").map((c) => `${c}${c}`).join("") : clean;
  if (normalized.length !== 6) return fallback;
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

async function recolorLogoDataUrl(dataUrl, color = "#EAF2FA") {
  if (!dataUrl || typeof window === "undefined") return dataUrl || null;
  try {
    const image = await loadImageElement(dataUrl);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || 1200;
    canvas.height = image.naturalHeight || 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    const { r, g, b } = hexToRgb(color);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    return canvas.toDataURL("image/png");
  } catch {
    return dataUrl;
  }
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

function pickGalleryImages(property) {
  const principal = property?.imagenPrincipal ? [property.imagenPrincipal] : [];
  const rest = Array.isArray(property?.imagenes) ? property.imagenes : [];
  return [...new Set([...principal, ...rest].filter(Boolean))];
}

async function createLotOverlayImage(property) {
  const lotOverlay = property?.lotOverlay || property?.loteDelimitacion;
  const points = Array.isArray(lotOverlay?.points) ? lotOverlay.points : [];
  const hasOverlay = Boolean(
    lotOverlay?.enabled !== false &&
      lotOverlay?.imageUrl &&
      points.length > 2
  );
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

    return canvas.toDataURL("image/jpeg", 0.88);
  } catch {
    return imageDataUrl;
  }
}

function getPrimaryFacts(property) {
  const items = [];
  const surface = Number(property?.superficie || 0);
  if (surface > 0) items.push(`Superficie: ${surface} m2`);

  const bedrooms = Number(property?.dormitorios || 0);
  if (bedrooms > 0) items.push(`Dormitorios: ${bedrooms}`);

  const baths = Number(property?.banos || 0);
  if (baths > 0) items.push(`Banos: ${baths}`);

  const garages = Number(property?.cochera || 0);
  if (garages > 0) items.push(`Cocheras: ${garages}`);

  const extras = Array.isArray(property?.caracteristicasExtras)
    ? property.caracteristicasExtras
        .filter((item) => item?.label && item?.value)
        .slice(0, 4)
        .map((item) => `${item.label}: ${item.value}`)
    : [];

  return [...items, ...extras];
}

function priceLabel(property) {
  return property?.consultarPrecio
    ? "Consultar precio"
    : formatCurrency(property?.precio, property?.moneda);
}

function drawWrappedText(doc, text, x, y, maxWidth, lineHeight = 4.8) {
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  lines.forEach((line, idx) => doc.text(line, x, y + idx * lineHeight));
  return lines.length * lineHeight;
}

function getStatusStyle(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "disponible") {
    return { label: "Disponible", fill: [232, 248, 239], text: [37, 118, 76], border: [157, 224, 186] };
  }
  if (normalized === "reservado") {
    return { label: "Reservado", fill: [255, 247, 232], text: [160, 100, 24], border: [239, 207, 149] };
  }
  if (normalized === "vendido") {
    return { label: "Vendido", fill: [240, 243, 247], text: [89, 105, 122], border: [205, 214, 223] };
  }
  if (normalized === "alquilado") {
    return { label: "Alquilado", fill: [235, 244, 252], text: [36, 95, 149], border: [178, 209, 236] };
  }
  return { label: toTitle(normalized), fill: [240, 243, 247], text: [89, 105, 122], border: [205, 214, 223] };
}

async function fitImageToBox(imageDataUrl, boxWidthMm, boxHeightMm, quality = 0.9) {
  if (!imageDataUrl || typeof window === "undefined") return null;
  try {
    const image = await loadImageElement(imageDataUrl);
    const targetRatio = boxWidthMm / boxHeightMm;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    let sx = 0;
    let sy = 0;
    let sw = image.naturalWidth;
    let sh = image.naturalHeight;

    if (imageRatio > targetRatio) {
      sh = image.naturalHeight;
      sw = sh * targetRatio;
      sx = (image.naturalWidth - sw) / 2;
    } else {
      sw = image.naturalWidth;
      sh = sw / targetRatio;
      sy = (image.naturalHeight - sh) / 2;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1200, Math.round(boxWidthMm * 10));
    canvas.height = Math.max(700, Math.round(boxHeightMm * 10));
    const ctx = canvas.getContext("2d");
    if (!ctx) return imageDataUrl;
    ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return imageDataUrl;
  }
}

export async function exportPropertyBrochurePdf(property) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const publicationUrl = absoluteUrl(`propiedades/${property.slug}`);
  const logoMarkUrl = absoluteUrl("logo-allianz-mark.png");
  const logoWordmarkUrl = absoluteUrl("logo-allianz-wordmark.png");
  const emittedAt = new Date();
  const emittedDate = new Intl.DateTimeFormat("es-PY", { dateStyle: "medium" }).format(emittedAt);
  const refCode = property?.id || property?.slug || "N/A";
  const statusStyle = getStatusStyle(property?.estado);

  const [logoMarkRawData, logoWordmarkRawData, qrData, mapQrData] = await Promise.all([
    fetchAsDataUrl(logoMarkUrl),
    fetchAsDataUrl(logoWordmarkUrl),
    QRCode.toDataURL(publicationUrl, {
      margin: 1,
      width: 280,
      color: { dark: "#0B1B2C", light: "#FFFFFF" },
    }).catch(() => null),
    property?.googleMapsUrl
      ? QRCode.toDataURL(property.googleMapsUrl, {
          margin: 1,
          width: 220,
          color: { dark: "#0B1B2C", light: "#FFFFFF" },
        }).catch(() => null)
      : Promise.resolve(null),
  ]);
  const [logoMarkData, logoWordmarkData] = await Promise.all([
    recolorLogoDataUrl(logoMarkRawData, "#5EA6D0"),
    recolorLogoDataUrl(logoWordmarkRawData, "#EAF2FA"),
  ]);

  const lotOverlayImage = await createLotOverlayImage(property);
  const principalImageData = await fetchAsDataUrl(property?.imagenPrincipal);
  const mainImageDataRaw = lotOverlayImage || principalImageData;
  const galleryPool = pickGalleryImages(property).filter((img) => img !== property?.imagenPrincipal);
  const additionalTargets =
    lotOverlayImage && property?.imagenPrincipal
      ? [property.imagenPrincipal, ...galleryPool.filter((img) => img !== property.imagenPrincipal)]
      : galleryPool;

  const [mainImageData, photoAData, photoBData] = await Promise.all([
    fitImageToBox(mainImageDataRaw, contentWidth, 86, 0.9),
    fitImageToBox(await fetchAsDataUrl(additionalTargets[0]), (contentWidth - 4) / 2, 30, 0.88),
    fitImageToBox(await fetchAsDataUrl(additionalTargets[1]), (contentWidth - 4) / 2, 30, 0.88),
  ]);

  doc.setFillColor(10, 28, 45);
  doc.rect(0, 0, pageWidth, 26, "F");
  if (logoMarkData) {
    doc.addImage(logoMarkData, "PNG", margin, 6.4, 8, 10.6);
  }
  if (logoWordmarkData) {
    doc.addImage(logoWordmarkData, "PNG", margin + 10.4, 7.8, 42, 7.6);
  } else {
    doc.setTextColor(235, 243, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12.6);
    doc.text("Allianz", margin + 10.2, 11.2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.6);
    doc.text("Bienes Raices", margin + 10.2, 15.7);
  }

  doc.setTextColor(207, 222, 235);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.text(`Emision: ${emittedDate}`, pageWidth - margin, 10.4, { align: "right" });
  doc.text(`Referencia: ${refCode}`, pageWidth - margin, 15.1, { align: "right" });

  let cursorY = 33.5;
  doc.setTextColor(13, 27, 44);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14.8);
  const titleHeight = drawWrappedText(doc, property?.titulo || "Propiedad", margin, cursorY, contentWidth - 8, 5.8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.6);
  doc.setTextColor(71, 92, 114);
  doc.text(formatOperationLabel(property?.tipoOperacion), margin, cursorY + titleHeight + 1.4);
  doc.text(priceLabel(property), margin + 40, cursorY + titleHeight + 1.4);
  doc.text(property?.ubicacion || "-", pageWidth - margin, cursorY + titleHeight + 1.4, { align: "right" });
  cursorY += titleHeight + 4.3;

  doc.setDrawColor(220, 226, 232);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 3.8;

  const mainImageHeight = 86;
  if (mainImageData) {
    doc.addImage(mainImageData, "JPEG", margin, cursorY, contentWidth, mainImageHeight, undefined, "FAST");
  } else {
    doc.setFillColor(239, 243, 247);
    doc.rect(margin, cursorY, contentWidth, mainImageHeight, "F");
  }

  cursorY += mainImageHeight + 5;

  const photoHeight = 30;
  const photoGap = 4;
  const photoWidth = (contentWidth - photoGap) / 2;
  if (photoAData) {
    doc.addImage(photoAData, "JPEG", margin, cursorY, photoWidth, photoHeight, undefined, "FAST");
  } else {
    doc.setFillColor(239, 243, 247);
    doc.rect(margin, cursorY, photoWidth, photoHeight, "F");
  }
  if (photoBData) {
    doc.addImage(photoBData, "JPEG", margin + photoWidth + photoGap, cursorY, photoWidth, photoHeight, undefined, "FAST");
  } else {
    doc.setFillColor(239, 243, 247);
    doc.rect(margin + photoWidth + photoGap, cursorY, photoWidth, photoHeight, "F");
  }
  cursorY += photoHeight + 6;

  const leftWidth = contentWidth * 0.62;
  const rightX = margin + leftWidth + 4;
  const rightWidth = contentWidth - leftWidth - 4;
  const rightBoxHeight = 33;
  const rightGap = 4;
  const rightBottomY = cursorY + rightBoxHeight + rightGap;
  const footerY = pageHeight - 18;
  const leftBottom = footerY - 3;

  doc.setDrawColor(222, 228, 234);
  doc.rect(margin, cursorY - 2.5, leftWidth, leftBottom - (cursorY - 2.5));
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 27, 44);
  doc.setFontSize(10.6);
  doc.text("Ficha comercial", margin + 3, cursorY + 2.4);

  doc.setFillColor(statusStyle.fill[0], statusStyle.fill[1], statusStyle.fill[2]);
  doc.setDrawColor(statusStyle.border[0], statusStyle.border[1], statusStyle.border[2]);
  doc.roundedRect(margin + 3, cursorY + 5.5, 28, 6.7, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(statusStyle.text[0], statusStyle.text[1], statusStyle.text[2]);
  doc.setFontSize(8.8);
  doc.text(statusStyle.label.toUpperCase(), margin + 17, cursorY + 10.1, { align: "center" });

  const surface = Number(property?.superficie || 0);
  doc.setTextColor(13, 27, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text("Superficie", margin + 3, cursorY + 16.7);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16.5);
  doc.text(surface > 0 ? `${surface} m2` : "-", margin + 3, cursorY + 24.1);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(8.8);
  let factsY = cursorY + 29.5;
  const facts = getPrimaryFacts(property).filter((item) => !String(item).toLowerCase().startsWith("superficie"));
  facts.slice(0, 4).forEach((fact) => {
    doc.text(`- ${fact}`, margin + 3, factsY);
    factsY += 4;
  });

  const desc = property?.descripcionCorta || property?.descripcionLarga || "";
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(8.8);
  drawWrappedText(doc, desc, margin + 3, factsY + 1.5, leftWidth - 6, 4.1);

  doc.setDrawColor(222, 228, 234);
  doc.rect(rightX, cursorY - 2.5, rightWidth, rightBoxHeight);
  doc.setDrawColor(219, 226, 233);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 27, 44);
  doc.setFontSize(9.7);
  doc.text("Publicacion", rightX + 2.6, cursorY + 2.6);
  if (qrData) {
    doc.addImage(qrData, "PNG", rightX + 2.8, cursorY + 5.2, 17.2, 17.2);
  }
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(7.8);
  drawWrappedText(doc, publicationUrl, rightX + 21.6, cursorY + 10.8, rightWidth - 23.8, 3.4);

  const mapBoxY = cursorY + rightBoxHeight + rightGap;
  doc.setDrawColor(222, 228, 234);
  doc.rect(rightX, mapBoxY, rightWidth, rightBoxHeight);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 27, 44);
  doc.setFontSize(9.5);
  doc.text("Ubicacion", rightX + 2.6, mapBoxY + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(7.8);
  if (property?.googleMapsUrl) {
    doc.text("Google Maps", rightX + 2.6, mapBoxY + 9.4);
    drawWrappedText(doc, property.googleMapsUrl, rightX + 2.6, mapBoxY + 13.2, rightWidth - 18.5, 3.4);
    if (mapQrData) {
      doc.addImage(mapQrData, "PNG", rightX + rightWidth - 13.8, mapBoxY + 3, 10.2, 10.2);
    }
  } else {
    doc.text("Sin enlace de mapa cargado", rightX + 2.6, mapBoxY + 10.2);
  }

  doc.setFillColor(245, 247, 250);
  doc.rect(0, footerY - 6, pageWidth, 30, "F");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 27, 44);
  doc.setFontSize(9.5);
  doc.text("Allianz Bienes Raices", margin, footerY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(8.4);
  doc.text(`${CONTACT_PHONE}   |   ${CONTACT_EMAIL}`, margin, footerY + 4.2);
  doc.text(CONTACT_CITY, margin, footerY + 8.3);

  doc.save(`ficha-${safeFileName(property?.titulo || property?.slug)}.pdf`);
}
