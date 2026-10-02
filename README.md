# Japon2026

Itinerario operativo mobile-first para el viaje a Japón de octubre de 2026.

## Desarrollo

    npm ci
    npm run dev
    npm run build

## Deploy

GitHub Pages mediante .github/workflows/deploy.yml al hacer push a main.

## Estructura

- src/content/segments/*.json: días y actividades.
- src/data/trip.ts: datos globales, anclas y listas compartidas de Maps.
- src/pages/hoy.astro: modo Hoy.
- src/pages/dias.astro: timeline.
- src/pages/mapas.astro: listas de Maps.
- src/pages/info.astro: logística.
- public/sw.js: offline/PWA.

No incluir secretos ni localizadores de reservas: el repositorio es público.
