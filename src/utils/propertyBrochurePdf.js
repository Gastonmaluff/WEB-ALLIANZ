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

async function fetchAsDataUrl(url) {
  if (!url) return null;
  if (String(url).startsWith("data:image/")) return url;
  try {
    const response = await fetch(url, { mode: "cors", cache: "no-store" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return blobToDataUrl(blob);
  } catch {
    return null;
  }
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

  const [logoMarkData, logoWordmarkData, qrData, mapQrData] = await Promise.all([
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

  const lotOverlayImage = await createLotOverlayImage(property);
  const gallery = pickGalleryImages(property);
  const additional = gallery.filter((img) => img !== property?.imagenPrincipal).slice(0, 2);
  const [mainImageData, photoAData, photoBData] = await Promise.all([
    lotOverlayImage || fetchAsDataUrl(property?.imagenPrincipal),
    fetchAsDataUrl(additional[0]),
    fetchAsDataUrl(additional[1]),
  ]);

  doc.setFillColor(10, 28, 45);
  doc.rect(0, 0, pageWidth, 26, "F");
  if (logoMarkData) {
    doc.addImage(logoMarkData, "PNG", margin, 6.2, 9, 12.2);
  }
  if (logoWordmarkData) {
    doc.addImage(logoWordmarkData, "PNG", margin + 11.5, 8.1, 36, 8.5);
  } else {
    doc.setTextColor(235, 243, 250);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("ALLIANZ", margin + 11.5, 13.6);
    doc.setFontSize(8.3);
    doc.text("BIENES RAICES", margin + 11.5, 18.2);
  }
  doc.setTextColor(207, 222, 235);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Emision: ${emittedDate}`, pageWidth - margin, 10.6, { align: "right" });
  doc.text(`Referencia: ${refCode}`, pageWidth - margin, 15.4, { align: "right" });

  let cursorY = 34;
  doc.setTextColor(13, 27, 44);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  const titleHeight = drawWrappedText(doc, property?.titulo || "Propiedad", margin, cursorY, contentWidth - 48, 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(77, 96, 116);
  doc.text(formatOperationLabel(property?.tipoOperacion), margin, cursorY + titleHeight + 1.6);
  doc.text(priceLabel(property), margin + 36, cursorY + titleHeight + 1.6);
  doc.text(property?.ubicacion || "-", margin + 86, cursorY + titleHeight + 1.6);
  cursorY += titleHeight + 6;

  doc.setDrawColor(220, 226, 232);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 4.6;

  const mainImageHeight = 90;
  if (mainImageData) {
    doc.addImage(mainImageData, "JPEG", margin, cursorY, contentWidth, mainImageHeight, undefined, "FAST");
  } else {
    doc.setFillColor(239, 243, 247);
    doc.rect(margin, cursorY, contentWidth, mainImageHeight, "F");
    doc.setTextColor(111, 128, 145);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Sin imagen principal", margin + contentWidth / 2, cursorY + mainImageHeight / 2, { align: "center" });
  }

  cursorY += mainImageHeight + 5;

  const leftWidth = contentWidth * 0.62;
  const rightX = margin + leftWidth + 4;
  const rightWidth = contentWidth - leftWidth - 4;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 27, 44);
  doc.setFontSize(11.2);
  doc.text("Ficha comercial", margin, cursorY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(9.2);
  const statusLabel = toTitle(String(property?.estado || "").replaceAll("_", " "));
  const facts = getPrimaryFacts(property);
  const firstFacts = [
    `Estado: ${statusLabel}`,
    ...facts.slice(0, 6),
  ];
  let factsY = cursorY + 4.8;
  firstFacts.forEach((fact) => {
    doc.text(`- ${fact}`, margin, factsY);
    factsY += 4.3;
  });

  const desc = property?.descripcionCorta || property?.descripcionLarga || "";
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(9.1);
  const descHeight = drawWrappedText(doc, desc, margin, factsY + 1.2, leftWidth - 2.2, 4.25);

  doc.setDrawColor(219, 226, 233);
  doc.rect(rightX, cursorY - 2.5, rightWidth, 42);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 27, 44);
  doc.setFontSize(10);
  doc.text("Publicacion", rightX + 2.8, cursorY + 2.6);
  if (qrData) {
    doc.addImage(qrData, "PNG", rightX + 2.8, cursorY + 5.2, 18, 18);
  }
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(8.2);
  drawWrappedText(doc, publicationUrl, rightX + 22.2, cursorY + 11.8, rightWidth - 24.8, 3.6);

  const mapBoxY = cursorY + 42.8;
  doc.rect(rightX, mapBoxY, rightWidth, 30);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 27, 44);
  doc.setFontSize(9.5);
  doc.text("Ubicacion", rightX + 2.8, mapBoxY + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 92, 114);
  doc.setFontSize(8.1);
  if (property?.googleMapsUrl) {
    doc.text("Google Maps", rightX + 2.8, mapBoxY + 9.4);
    drawWrappedText(doc, property.googleMapsUrl, rightX + 2.8, mapBoxY + 13.2, rightWidth - 19, 3.4);
    if (mapQrData) {
      doc.addImage(mapQrData, "PNG", rightX + rightWidth - 14.8, mapBoxY + 3, 11.2, 11.2);
    }
  } else {
    doc.text("Sin enlace de mapa cargado", rightX + 2.8, mapBoxY + 10.2);
  }

  const photosY = Math.max(cursorY + 76.5, factsY + descHeight + 8);
  const photoHeight = 30;
  const photoGap = 4;
  const photoWidth = (contentWidth - photoGap) / 2;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(13, 27, 44);
  doc.setFontSize(10);
  doc.text("Galeria", margin, photosY - 2.3);
  if (photoAData) {
    doc.addImage(photoAData, "JPEG", margin, photosY, photoWidth, photoHeight, undefined, "FAST");
  } else {
    doc.setFillColor(239, 243, 247);
    doc.rect(margin, photosY, photoWidth, photoHeight, "F");
  }
  if (photoBData) {
    doc.addImage(photoBData, "JPEG", margin + photoWidth + photoGap, photosY, photoWidth, photoHeight, undefined, "FAST");
  } else {
    doc.setFillColor(239, 243, 247);
    doc.rect(margin + photoWidth + photoGap, photosY, photoWidth, photoHeight, "F");
  }

  const footerY = pageHeight - 18;
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

