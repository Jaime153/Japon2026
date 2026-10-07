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
    place: 'Salida Akabanebashi de la estación 赤羽橋',
    lat: 35.654786,
    lng: 139.745513,
    accuracy: 'exacto',
    mapQuery: '35.654786,139.745513',
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
    tip: 'Baja las escaleras y fotografía desde abajo: los muros encuadran toda la torre.',
    note: 'Es el spot de la foto de las escaleras del TikTok. Puede haber mucha cola; no bloquear el paso y no usar trípode.',
    bestTime: 'ambos',
  },
  {
    number: 5,
    slug: 'callejon-kaledo',
    title: 'Callejón entre edificios',
    place: 'KALEDO TOWER · 1-3-6 Higashiazabu',
    lat: 35.6579,
    lng: 139.7425,
    accuracy: 'referencia',
    mapQuery: 'KALEDO TOWER 1-3-6 Higashiazabu Minato Tokyo',
    tip: 'Encuadra la torre entre los edificios desde el callejón público cercano.',
    note: 'El pin señala el entorno del edificio; busca el encuadre desde la calle sin entrar a propiedades privadas.',
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