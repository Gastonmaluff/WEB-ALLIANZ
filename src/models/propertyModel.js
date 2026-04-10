export const PROPERTY_STATUS = ["disponible", "vendido", "alquilado", "reservado"];
export const OPERATION_TYPES = ["venta", "alquiler", "venta_o_alquiler"];

export const emptyProperty = {
  titulo: "",
  slug: "",
  tipoOperacion: "venta",
  tipoPropiedad: "",
  precio: 0,
  moneda: "USD",
  ubicacion: "",
  googleMapsUrl: "",
  superficie: 0,
  dormitorios: 0,
  banos: 0,
  cochera: 0,
  descripcionCorta: "",
  descripcionLarga: "",
  estado: "disponible",
  imagenPrincipal: "",
  imagenes: [],
  destacadaEnPortada: false,
  publicada: true,
  createdAt: new Date().toISOString(),
};
