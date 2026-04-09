# Allianz Bienes Raices - Web App

Base profesional inicial de una web app inmobiliaria premium, dividida en:

- Sitio publico
- Panel admin privado

## Stack

- React + Vite
- Tailwind CSS
- React Router
- Firebase (Auth, Firestore, Storage) preparado

## Ejecutar local

```bash
npm install
npm run dev
```

Para build de produccion:

```bash
npm run build
```

## Variables de entorno

1. Copiar `.env.example` a `.env`
2. Verificar credenciales de Firebase

## Estructura principal

```text
src/
  components/
    common/
    public/
    admin/
  layouts/
  pages/
    public/
    admin/
  router/
  firebase/
  mocks/
  models/
  styles/
```

## Estado actual

- Router publico y admin configurado
- Layout publico premium + layout admin listos
- Paginas base creadas
- CRUD base de propiedades y testimonios (UI scaffold)
- Guard de admin mock listo para conectar Firebase Auth
- Servicios Firebase listos para conectar data real en Firestore/Storage
