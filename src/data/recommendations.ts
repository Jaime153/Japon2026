export type RecommendationScope = '2026' | 'future' | 'backup' | 'advice';
export type RecommendationPriority = 'must' | 'try' | 'optional' | 'avoid';

export interface RecommendationLink {
  label: string;
  url: string;
  kind?: 'maps' | 'tabelog' | 'official' | 'menu' | 'other';
}

export interface Recommendation {
  id: string;
  title: string;
  area: string;
  category: 'comida' | 'compras' | 'experiencia' | 'excursion' | 'consejo';
  scope: RecommendationScope;
  priority: RecommendationPriority;
  source: string;
  summary: string;
  fit2026?: string;
  notes?: string[];
  query?: string;
  links?: RecommendationLink[];
}

export const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'imahan-honten',
    title: 'Imahan Honten',
    area: 'Asakusa · Tokio',
    category: 'comida',
    scope: '2026',
    priority: 'must',
    source: 'Alberto · clases 25–27',
    summary: 'Sukiyaki tradicional en un edificio histórico. Alberto lo recomendó especialmente por la experiencia y por la comida; requiere planificar reserva.',
    fit2026: 'Intentar en 2026, pero no forzarlo el martes 6: el día de Asakusa/Kappabashi debe seguir mandando.',
    notes: [
      'No confundir con Asakusa Imahan Kokusai-dori: durante la clase se miraron ambos nombres.',
      'La recomendación original era la experiencia de sukiyaki en edificio histórico/protegido.',
    ],
    query: 'Imahan Honten Asakusa Tokyo',
    links: [
      { label: 'Reservas', url: 'https://imahan-honten.co.jp/reservation.html', kind: 'official' },
      { label: 'Maps', url: 'https://www.google.com/maps/search/?api=1&query=Imahan%20Honten%20Asakusa%20Tokyo', kind: 'maps' },
    ],
  },
  {
    id: 'nakamoto',
    title: 'Mouko Tanmen Nakamoto',
    area: 'Tokio',
    category: 'comida',
    scope: '2026',
    priority: 'must',
    source: 'Alberto · clases 25–27',
    summary: 'El ramen picante de la recomendación del “nivel 5”. El punto importante de la clase era no ir directamente al máximo y probar el equilibrio de picante/sabor.',
    fit2026: 'Intentar en Tokio cuando encaje con la ruta; no sustituye a Menya Musashi Takatora, que es la recomendación de tsukemen.',
    notes: [
      'La clase dejó inicialmente el nombre ambiguo entre Nakamoto/Takatora; se guardan como recomendaciones distintas.',
      'Si alguien no quiere picante, no convertirlo en comida obligatoria para todo el grupo.',
    ],
    query: 'Mouko Tanmen Nakamoto Okachimachi Tokyo',
    links: [
      { label: 'Web oficial', url: 'https://www.moukotanmen-nakamoto.com/', kind: 'official' },
      { label: 'Maps', url: 'https://www.google.com/maps/search/?api=1&query=Mouko%20Tanmen%20Nakamoto%20Okachimachi', kind: 'maps' },
    ],
  },
  {
    id: 'fujitaya',
    title: 'Fujitaya · あなごめし ふじたや',
    area: 'Miyajima · Hiroshima',
    category: 'comida',
    scope: '2026',
    priority: 'must',
    source: 'Alberto · clases 25–27',
    summary: 'Candidato principal para resolver la recomendación de Alberto de comer anago meshi en Miyajima.',
    fit2026: 'Encaja directamente el 21 de octubre, día completo de Miyajima. Mantenerlo en Recomendaciones hasta decidir si sustituye el “Anago meshi” genérico del timeline.',
    notes: [
      'El anago meshi era una de las recomendaciones gastronómicas más concretas de la clase.',
      'La web oficial indica que no admite reservas: conviene asumir cola.',
    ],
    query: 'Fujitaya Miyajima',
    links: [
      { label: 'Web oficial', url: 'https://www.fujitayamiyajima.com/', kind: 'official' },
      { label: 'Maps', url: 'https://www.google.com/maps/search/?api=1&query=Fujitaya%20Miyajima', kind: 'maps' },
    ],
  },
  {
    id: 'haru-nara',
    title: '洋食 春 · Yoshoku Haru',
    area: 'Naramachi · Nara',
    category: 'comida',
    scope: '2026',
    priority: 'try',
    source: 'Alberto · clase / enlaces buscados',
    summary: 'Yōshoku en una casa tradicional de Naramachi; hamburg steak y ebi fry. Es uno de los sitios concretos que se buscaron durante la clase.',
    fit2026: 'Muy buen candidato para el día de Nara si la cola y el orden del recorrido encajan.',
    query: '洋食 春 奈良市公納堂町14',
    links: [
      { label: 'Web oficial', url: 'https://haru-nara.com/store.html', kind: 'official' },
      { label: 'Maps', url: 'https://www.google.com/maps/place/Haru/@34.6772583,135.8332993,17z', kind: 'maps' },
    ],
  },
  {
    id: 'tsurutontan-roppongi',
    title: 'Tsurutontan Roppongi',
    area: 'Roppongi · Tokio',
    category: 'comida',
    scope: '2026',
    priority: 'try',
    source: 'Alberto · clases 25–27',
    summary: 'Udon con muchas variantes; es la referencia que encaja con el udon “carbonara” mencionado en clase y con horarios muy tardíos.',
    fit2026: 'Guardar como opción nocturna si terminamos por Roppongi/Tokyo Tower con hambre; no convertirlo en ancla del día.',
    query: 'Tsurutontan Roppongi Tokyo',
    links: [
      { label: 'Tabelog', url: 'https://tabelog.com/en/tokyo/A1307/A130701/13001859/', kind: 'tabelog' },
      { label: 'Maps', url: 'https://www.google.com/maps/search/?api=1&query=Tsurutontan%20Roppongi', kind: 'maps' },
    ],
  },
  {
    id: 'ginza-kyubey',
    title: 'Ginza Kyubey · Ginza Honten',
    area: 'Ginza · Tokio',
    category: 'comida',
    scope: '2026',
    priority: 'try',
    source: 'Alberto · enlaces buscados en clase',
    summary: 'Sushi de gama alta. Guardarlo como opción especial si decidimos dedicar presupuesto y una comida concreta a sushi bueno.',
    fit2026: 'No meter automáticamente en el timeline: decidir por presupuesto y reserva.',
    notes: [
      'No etiquetarlo como “el restaurante de Obama”: esa pista de la conversación no quedó confirmada para Kyubey.',
    ],
    query: 'Ginza Kyubey Ginza Honten',
    links: [
      { label: 'Tabelog', url: 'https://tabelog.com/en/tokyo/A1301/A130103/13002611/', kind: 'tabelog' },
      { label: 'Maps', url: 'https://www.google.com/maps/search/?api=1&query=Ginza%20Kyubey%20Ginza%20Honten', kind: 'maps' },
    ],
  },
  {
    id: 'billy-the-kid',
    title: 'Billy the Kid Sumida Honten',
    area: 'Sumida · Tokio',
    category: 'comida',
    scope: 'backup',
    priority: 'optional',
    source: 'Alberto · enlace buscado en clase',
    summary: 'Steak house identificado a partir del enlace Tabelog revisado en clase.',
    fit2026: 'Opción secundaria si estamos por el este de Tokio y encaja; no desplaza los restaurantes prioritarios.',
    query: 'Billy the Kid Sumida Honten Tokyo',
    links: [
      { label: 'Tabelog', url: 'https://tabelog.com/en/tokyo/A1312/A131203/13085454/', kind: 'tabelog' },
      { label: 'Maps', url: 'https://www.google.com/maps/search/?api=1&query=Billy%20the%20Kid%20Sumida%20Honten', kind: 'maps' },
    ],
  },
  {
    id: 'bikkuri-donkey',
    title: 'Bikkuri Donkey',
    area: 'Varias zonas · Tokio',
    category: 'comida',
    scope: 'backup',
    priority: 'optional',
    source: 'Alberto · clase / enlace oficial',
    summary: 'Family restaurant de hamburg steak, barato y sencillo. Encaja con la recomendación de una hamburguesería familiar económica.',
    fit2026: 'Plan B cómodo si necesitamos comer fácil/barato; no merece desviar el itinerario.',
    query: 'Bikkuri Donkey Tokyo',
    links: [
      { label: 'Locales Tokio', url: 'https://www.bikkuri-donkey.com/prefecture/tokyo/', kind: 'official' },
    ],
  },
  {
    id: 'saizeriya',
    title: 'Saizeriya',
    area: 'Varias zonas · Japón',
    category: 'comida',
    scope: 'backup',
    priority: 'optional',
    source: 'Enlaces buscados en clase',
    summary: 'Family restaurant italiano-japonés muy económico. Útil como comodín por precio, horarios o cansancio.',
    fit2026: 'Backup, no destino gastronómico del viaje.',
    query: 'Saizeriya Tokyo',
    links: [
      { label: 'Maps', url: 'https://www.google.com/maps/search/?api=1&query=Saizeriya%20Tokyo', kind: 'maps' },
      { label: 'Menú visto en clase', url: 'https://www.saizeriya.com.sg/pdf/GrandMenu202609S_single.pdf', kind: 'menu' },
    ],
  },
  {
    id: 'yodobashi-akihabara',
    title: 'Yodobashi Camera Akihabara',
    area: 'Akihabara · Tokio',
    category: 'compras',
    scope: '2026',
    priority: 'must',
    source: 'Alberto · clases 25–27',
    summary: 'Alberto insistió en que es parada obligatoria: cámaras, electrónica, ropa y regalos.',
    fit2026: 'Ya encaja dentro del bloque de Akihabara del 7 de octubre; la recomendación sirve para priorizar esta tienda dentro del barrio.',
    query: 'Yodobashi Akiba Tokyo',
    links: [
      { label: 'Maps', url: 'https://www.google.com/maps/search/?api=1&query=Yodobashi%20Akiba%20Tokyo', kind: 'maps' },
    ],
  },
  {
    id: 'uji-matcha',
    title: 'Uji para matcha',
    area: 'Uji · Kyoto',
    category: 'excursion',
    scope: 'future',
    priority: 'try',
    source: 'Alberto · clases 25–27',
    summary: 'Alberto señaló Uji como referencia para matcha y té.',
    fit2026: 'No añadido al planning 2026. Guardado para otro viaje o por si en el futuro abrimos hueco real.',
    query: 'Uji Kyoto Japan',
  },
  {
    id: 'sumida-night-cruise',
    title: 'Crucero nocturno por el Sumida hacia Odaiba',
    area: 'Tokio',
    category: 'experiencia',
    scope: 'future',
    priority: 'must',
    source: 'Alberto · clases 25–27',
    summary: 'Recomendación fuerte de Alberto: puentes iluminados y vistas nocturnas desde el agua.',
    fit2026: 'NO es para este viaje. Guardado expresamente para otro año / futuro viaje a Tokio.',
    query: 'Sumida River Cruise Tokyo Odaiba',
  },
  {
    id: 'yokohama-fuji-return',
    title: 'Volver del Fuji pasando por Yokohama',
    area: 'Fuji / Yokohama',
    category: 'excursion',
    scope: 'future',
    priority: 'optional',
    source: 'Alberto · clases 25–27',
    summary: 'Idea de ruta en coche combinando Fuji y Yokohama.',
    fit2026: 'No añadir al Fuji 2026 salvo decisión explícita; queda guardado como variante para futuros viajes.',
    query: 'Yokohama Japan',
  },
  {
    id: 'kamakura',
    title: 'Kamakura',
    area: 'Kanagawa',
    category: 'excursion',
    scope: 'future',
    priority: 'try',
    source: 'Alberto · clases 25–27',
    summary: 'Mencionada por la ruta hacia Fuji y porque Alberto comenta que se come bien.',
    fit2026: 'No forma parte del itinerario 2026 actual.',
    query: 'Kamakura Japan',
  },
  {
    id: 'mito-monkeys',
    title: 'Mito · “templo/parque de los monos”',
    area: 'Mito',
    category: 'excursion',
    scope: 'future',
    priority: 'optional',
    source: 'Alberto · clases 25–27',
    summary: 'Sitio de monos mencionado en clase; el nombre exacto quedó sin identificar.',
    fit2026: 'Solo archivo de ideas futuras hasta identificar el lugar exacto.',
  },
  {
    id: 'gotouchi-kitty',
    title: 'Gotōchi Kitty-chan',
    area: 'Compras · por regiones',
    category: 'compras',
    scope: '2026',
    priority: 'try',
    source: 'Alberto · clases 25–27',
    summary: 'Hello Kitty regionales diferentes por prefectura/ciudad. Buen souvenir para buscar durante el viaje.',
    fit2026: 'Buscar cuando aparezcan sin desviar el planning; Yodobashi puede reunir varias.',
  },
  {
    id: 'ichiran-advice',
    title: 'Ichiran · consejo de Alberto',
    area: 'Tokio / Kyoto / Osaka',
    category: 'consejo',
    scope: 'advice',
    priority: 'avoid',
    source: 'Alberto · clases 25–27',
    summary: 'Alberto recomienda evitar Ichiran en Tokio; si se quiere probar, prefiere Kyoto u Osaka.',
    fit2026: 'Consejo guardado, no una parada.',
  },
  {
    id: 'ramen-sold-out',
    title: 'Ramen en Kyoto · ir antes de que se acabe el caldo',
    area: 'Kyoto',
    category: 'consejo',
    scope: 'advice',
    priority: 'optional',
    source: 'Alberto · clases 25–27',
    summary: 'Algunos locales cierran cuando se termina el caldo del día aunque el horario publicado sea más largo.',
    fit2026: 'Útil para Ramen Sen-no-Kaze u otros locales populares: no dejarlo automáticamente para última hora.',
  },
];
