/**
 * Planificador del mapa. Solo trabaja con datos del itinerario: nada de rutas inventadas.
 * Un tramo "transit/mixed" muestra paradas y enlaces entre puntos, no una línea a pie.
 */
const iso = (value) => value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
const hotelStop = (hotel, kind) => {
  if (!hotel) return null;
  // El nombre GN98 no siempre localiza bien el edificio; preferir el pin verificado.
  const coded = hotel.mapsUrl?.match(/[?&]query=([^&]+)/)?.[1];
  const parsed = coded ? decodeURIComponent(coded.replace(/\+/g, ' ')) : '';
  const query = /^\d{2}\.\d+,\s*\d{3}\.\d+$/.test(parsed) ? parsed : (hotel.address || hotel.name);
  return {
    id: '@hotel-' + kind,
    title: (kind === 'start' ? 'Salir de ' : 'Volver a / llegar a ') + hotel.name,
    query,
    note: hotel.address || '',
    category: 'transporte',
    kind: 'hotel',
  };
};
const activityStop = (a) => ({
  id: a.id,
  title: a.title,
  query: a.parking?.mapsQuery || a.locationQuery || a.address || '',
  note: a.parking?.notes || a.notes?.slice(0, 135) || '',
  time: a.time || '',
  category: a.category,
  kind: 'activity',
  mapcode: a.parking?.mapcode || '',
  mapcodeKind: a.parking?.kind || '',
  spotQuery: a.parking?.spotQuery || '',
});
const routeStop = (s, index) => ({
  id: 'legacy-' + index, title: s.title, query: s.locationQuery,
  note: s.note || '', time: '', category: 'otro', kind: 'route',
  mapcode: s.mapcode || '', mapcodeKind: s.mapcodeKind || '',
  spotQuery: s.spotQuery || '',
});
function uniqueConsecutive(stops) {
  return stops.filter((s, i) => s?.query && (!i || stops[i - 1]?.query !== s.query));
}
const stage = (id, label, mode, stops, expandable = false) =>
  ({ id, label, mode, stops: uniqueConsecutive(stops), expandable });

function clockPart(a, fallback) {
  const match = String(a.time || '').match(/(?:^|[^\d])(\d{1,2}):(\d\d)/);
  const hour = match ? Number(match[1]) : null;
  if (hour !== null) return hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'night';
  if (/noche|cena|night/i.test(a.time || '')) return 'night';
  return fallback;
}
function normalStages(activities, start, end) {
  const named = [['morning', 'Mañana'], ['afternoon', 'Tarde'], ['night', 'Noche']];
  let current = 'morning';
  const groups = { morning: [], afternoon: [], night: [] };
  for (const a of activities) {
    current = clockPart(a, current);
    const s = activityStop(a);
    if (s.query) groups[current].push(s);
  }
  let anchor = start;
  const out = [];
  for (const [id, label] of named) {
    const stops = groups[id];
    if (!stops.length) continue;
    const scoped = [...(anchor ? [anchor] : []), ...stops];
    out.push(stage(id, label, 'transit', scoped));
    anchor = stops[stops.length - 1];
  }
  if (!out.length) return [stage('day', 'Día', 'transit', [start, end].filter(Boolean))];
  if (end) out[out.length - 1].stops = uniqueConsecutive([...out[out.length - 1].stops, end]);
  return out;
}
function detailedStages(day, start, end) {
  const all = new Map(day.activities.map(a => [a.id, a]));
  const resolve = (ref) => {
    if (ref === '@hotel-start') return start;
    if (ref === '@hotel-end') return end;
    const a = all.get(ref);
    if (!a || !a.locationQuery && !a.address) return null;
    return activityStop(a);
  };
  return day.mapStages.map(def => stage(def.id, def.title, def.mode,
    def.activityIds.map(resolve).filter(Boolean), Boolean(def.expandable)));
}
function fujiStages(day, start, end) {
  const stops = day.routeStops.map(routeStop);
  if (stops.length < 3) return normalStages(day.activities.filter(a => a.status !== 'opcional' && !a.skipped), start, end);
  return [
    stage('salida', 'Hotel → recoger coche', 'transit', [start, stops[0]]),
    stage('fuji', 'Fuji · aparcamientos y paradas', 'drive', stops),
    stage('regreso', 'Devolver coche → hotel', 'transit', [stops[stops.length - 1], end]),
  ];
}
function nagoyaStages(day, start, end) {
  const stops = day.routeStops.map(routeStop);
  if (stops.length < 8) return normalStages(day.activities.filter(a => !a.skipped && a.status !== 'opcional'), start, end);
  const nagoya = stops.findIndex(s => /Nagoya Station.*consigna|Nagoya Station.*maletas/i.test(s.title));
  const osaka = stops.findIndex(s => /Shin-Osaka Station/.test(s.title));
  const lastStay = stops.findIndex(s => /alojamiento GN98/.test(s.title));
  if (nagoya < 1 || osaka <= nagoya || lastStay <= osaka) return [stage('transfer', 'Tokio → Nagoya → Osaka', 'mixed', [start, ...stops, end])];
  return [
    stage('tokio-nagoya', 'Hotel Tokio → Nagoya', 'transit', [start, ...stops.slice(0, nagoya + 1)]),
    stage('nagoya', 'Castillo y misokatsu', 'mixed', stops.slice(nagoya, osaka)),
    stage('nagoya-osaka', 'Nagoya → hotel Osaka', 'transit', [stops[osaka - 1], ...stops.slice(osaka, lastStay + 1)]),
    stage('noche-osaka', 'Noche en Osaka y vuelta', 'walk', [stops[lastStay], ...stops.slice(lastStay + 1), end]),
  ];
}

/**
 * @param {Array<{order:number,city:string,hotel?:object,startDate:Date|string,endDate:Date|string,days:Array<object>}>} segments
 */
export function createMapDays(segments) {
  const ordered = [...segments].sort((a, b) => a.order - b.order);
  const dates = new Map();
  for (const seg of ordered) {
    for (const day of seg.days) {
      const date = iso(day.date);
      if (!dates.has(date)) dates.set(date, []);
      dates.get(date).push({ seg, day });
    }
  }
  return [...dates.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, entries]) => {
    const currentSegments = ordered.filter(s => iso(s.startDate) <= date && iso(s.endDate) >= date && s.hotel);
    const startHotel = entries[0].seg.hotel || currentSegments[0]?.hotel;
    const endHotel = currentSegments.at(-1)?.hotel || entries.at(-1).seg.hotel;
    const start = hotelStop(startHotel, 'start');
    const end = hotelStop(endHotel, 'end');
    const firstDay = entries[0].day;
    const allActivities = entries.flatMap(({day}) => day.activities);
    const included = allActivities.filter(a => !a.skipped && !['opcional', 'pendiente'].includes(a.status));
    const optional = allActivities.filter(a => a.status === 'opcional' && !a.skipped && (a.locationQuery || a.address)).map(activityStop);
    const arrival = firstDay.title?.toLowerCase().startsWith('llegada') &&
      included[0]?.locationQuery?.toLowerCase().includes('airport');
    const actualStart = arrival ? null : start;
    let stages;
    if (entries.length === 1 && firstDay.mapStages?.length) {
      stages = detailedStages(firstDay, actualStart, end);
    } else if (date === '2026-10-09' && firstDay.routeStops?.length) {
      stages = fujiStages(firstDay, start, end);
    } else if (date === '2026-10-10' && firstDay.routeStops?.length) {
      stages = nagoyaStages(firstDay, start, end);
    } else {
      stages = normalStages(included, actualStart, end);
    }
    const alternatives = entries.flatMap(({seg}) =>
      (seg.candidateModules || []).filter(alt => alt.forDate && iso(alt.forDate) === date)
        .map(alt => {
          const altStops = alt.activities.filter(a => !a.skipped && a.status !== 'pendiente').map(activityStop).filter(a => a.query);
          return {
            id: alt.id,
            label: alt.switchLabel || alt.title,
            stages: [stage('alternative', alt.title, date === '2026-10-09' ? 'drive' : 'mixed', [actualStart, ...altStops, end])],
          };
        }));
    return {
      date,
      title: entries.map(x => x.day.title || x.seg.city).join(' · '),
      city: entries.map(x => x.seg.city).filter((v, i, a) => a.indexOf(v) === i).join(' → '),
      stages: stages.filter(s => s.stops.length > 0),
      optional,
      mainLabel: firstDay.switchLabel || 'Plan',
      variants: alternatives,
      hotelStart: startHotel?.name || null,
      hotelEnd: endHotel?.name || null,
    };
  });
}
