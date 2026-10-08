/**
 * Spots del TikTok compartido por Jaime (Tokyo Tower Photo Package).
 * NO son actividades confirmadas del itinerario: colección opcional de fotografías.
 *
 * Los números mantienen el orden del mapa original. 'referencia' significa que
 * las coordenadas apuntan al parque/edificio cercano, no al encuadre exacto.
 * Para esos casos la navegación usa búsqueda del lugar, no un punto GPS inventado.
 */
export type PhotoSpotAccuracy = 'exacto' | 'referencia';

export interface TokyoTowerPhotoSpot {
  number: number;
  slug: string;
  title: string;
  place: string;
  lat: number;
  lng: number;
  accuracy: PhotoSpotAccuracy;
  mapQuery: string;
  tip: string;
  note?: string;
  bestTime: 'dia' | 'noche' | 'ambos';
}

export const TOKYO_TOWER_TIKTOK_URL = 'https://vm.tiktok.com/ZN8kQ5qCP/';

export const TOKYO_TOWER_PHOTO_SPOTS: TokyoTowerPhotoSpot[] = [
  {
    number: 1,
    slug: 'cartel-akabanebashi',
    title: 'Cartel de Akabanebashi',
    place: 'Cruce Akabanebashi · Shibakōen 4-chōme-9',
    lat: 35.654748,
    lng: 139.745514,
    accuracy: 'exacto',
    mapQuery: '35.654748,139.745514',
    tip: 'Encuadra el cartel de la estación, el cruce y Tokyo Tower al fondo.',
    note: 'Haz la foto desde la acera, sin detenerte en la calzada.',
    bestTime: 'dia',
  },
  {
    number: 2,
    slug: 'bancos-shiba-17',
    title: 'Bancos de Shiba Park',
    place: '芝公園17号地 · Shiba Park n.º 17',
    lat: 35.6558,
    lng: 139.7466,
    accuracy: 'referencia',
    mapQuery: '芝公園17号地, 4 Chome-6-8 Shibakoen Tokyo',
    tip: 'Busca los bancos tumbados o reclinables; foto relajada con la torre por encima de los árboles.',
    note: 'El pin indica la zona del parque; el banco concreto no está geolocalizado.',
    bestTime: 'dia',
  },
  {
    number: 3,
    slug: 'salto-hokkaido-wine',
    title: 'Foto saltando',
    place: 'Cerca de Hokkaido Wine · 東京営業所',
    lat: 35.6561,
    lng: 139.7455,
    accuracy: 'referencia',
    mapQuery: '北海道ワイン株式会社 東京営業所 東京都港区芝公園4丁目6-1',
    tip: 'Graba un vídeo en ráfaga mientras saltas y extrae el fotograma en el aire.',
    note: 'El pin referencia la oficina citada por la guía, no un lugar exacto para saltar.',
    bestTime: 'dia',
  },
  {
    number: 4,
    slug: 'escaleras-ocultas',
    title: 'Escaleras con Tokyo Tower',
    place: 'Tokyo Tower Hidden Stairs · acceso al aparcamiento subterráneo',
    lat: 35.6570979,
    lng: 139.7457514,
    accuracy: 'exacto',
    mapQuery: '35.6570979,139.7457514',
    tip: 'Referencia visual al encuadre viral de la escalera: Tokyo Tower solicita no hacer fotos en las escaleras del aparcamiento.',
    note: 'Ubicación guardada únicamente como referencia. La web oficial pide abstenerse de fotografiar en estas escaleras por seguridad y por respeto a los usuarios del aparcamiento. No bajar para posar o hacer fotos.',
    bestTime: 'ambos',
  },
  {
    number: 5,
    slug: 'callejon-higashiazabu',
    title: 'Callejón entre edificios',
    place: 'Junto a Belle Face Higashiazabu · Higashiazabu 1-9-16',
    lat: 35.657955,
    lng: 139.743941,
    accuracy: 'exacto',
    mapQuery: '35.657955,139.743941',
    tip: 'Encuadra la torre entre los edificios desde el callejón público cercano.',
    note: 'Punto exacto marcado en Google Maps junto a ベルファース東麻布 (Belle Face Higashiazabu). Haz la foto desde la vía pública.',
    bestTime: 'ambos',
  },
  {
    number: 6,
    slug: 'columpio-agua',
    title: 'Columpio con la torre',
    place: '芝給水所公園 · Shiba Water Supply Station Park',
    lat: 35.6609,
    lng: 139.7455,
    accuracy: 'referencia',
    mapQuery: '芝給水所公園 3 Chome-6-7 Shibakoen Tokyo',
    tip: 'Usa el columpio del parque infantil y deja Tokyo Tower centrada detrás.',
    note: 'La ubicación indica el parque, no el columpio exacto. Horario municipal publicado: 10:00–19:00; comprobar al llegar.',
    bestTime: 'dia',
  },
  {
    number: 7,
    slug: 'bar-stellar-garden',
    title: 'Bar con vista nocturna',
    place: 'Sky Bar & Dining Stellar Garden · The Prince Park Tower Tokyo, 33F',
    lat: 35.65542,
    lng: 139.7471,
    accuracy: 'referencia',
    mapQuery: 'Sky Bar and Dining Stellar Garden The Prince Park Tower Tokyo',
    tip: 'Fotografía Tokyo Tower iluminada a través de las ventanas del bar.',
    note: 'Pin del hotel, no de una mesa. El área de bar funciona con reserva de plan según su web oficial; no es un mirador público gratuito.',
    bestTime: 'noche',
  },
  {
    number: 8,
    slug: 'silueta-nocturna',
    title: 'Silueta nocturna',
    place: 'Cerca de IJCEE / 機械振興会館 · Shibakoen 3-5-8',
    lat: 35.659578,
    lng: 139.745247,
    accuracy: 'referencia',
    mapQuery: '機械振興会館 3-5-8 Shibakoen Tokyo',
    tip: 'Deja a la persona a contraluz, con Tokyo Tower iluminada detrás.',
    note: 'Referencia del instituto del TikTok. El pin es del edificio, NO garantiza que desde allí se vea exactamente el encuadre: busca una zona pública próxima.',
    bestTime: 'noche',
  },
];