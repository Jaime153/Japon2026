/**
 * Smoke tests del mapa: ejecución sin navegador, usando el itinerario real.
 * npm run build -> check:content -> este test.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createMapDays } from '../src/lib/map-planner.mjs';

const segments = readdirSync('src/content/segments')
  .filter(file => file.endsWith('.json'))
  .map(file => JSON.parse(readFileSync(join('src/content/segments', file), 'utf8')));
const dates = createMapDays(segments);
const failures = [];
function assert(ok, message) { if (!ok) failures.push(message); }
function get(date) {
  const result = dates.find(d => d.date === date);
  assert(Boolean(result), 'Falta día ' + date);
  return result;
}
const asakusa = get('2026-10-06');
if (asakusa) {
  assert(asakusa.stages.length === 4, 'Asakusa: deben ser cuatro tramos');
  assert(asakusa.stages[0].stops[0].kind === 'hotel', 'Asakusa: empieza en hotel Tokio');
  const shichi = asakusa.stages.find(s => s.id === 'shichifukujin');
  assert(shichi?.stops.length === 9 && shichi?.expandable && shichi?.mode === 'walk' && shichi?.closeLoop,
    'Shichifukujin: nueve templos, recorrido a pie desplegable y cierre del circuito');
  assert(asakusa.stages.find(s => s.id === 'kappabashi')?.stops[0].id === 'sensoji',
    'Tras el circuito, la visita Nakamise debe continuar desde Sensō-ji');
  const dayStops = asakusa.stages.flatMap(s => s.stops.map(p => p.id));
  assert(dayStops.includes('tonkatsu-oribe-asakusa') && dayStops.includes('kappabashi')
    && dayStops.includes('skytree'), 'Asakusa: falta comida, Kappabashi o Skytree');
  assert(asakusa.stages.at(-1).stops.at(-1).kind === 'hotel',
    'Asakusa: la ruta no vuelve al hotel');
  assert(!dayStops.includes('cattlea'), 'Asakusa: Cattlea se saltó y no debe añadirse');
}
const fuji = get('2026-10-09');
if (fuji) {
  assert(fuji.stages.some(s => s.mode === 'drive' && s.stops.length === 9),
    'Fuji: deben mantenerse los nueve puntos de conducción');
  assert(fuji.variants.some(v => v.id === 'okutama-plan-b-fuji'),
    'Fuji: se ha perdido el plan alternativo');
}
const nagoya = get('2026-10-10');
if (nagoya) {
  assert(nagoya.stages.length === 3, 'Hoy 10/10: tras cancelar la noche, solo deben quedar tres tramos');
  const trip = nagoya.stages.flatMap(s => s.stops.map(p => p.title));
  const yamato = trip.findIndex(s => s.includes('Kuroneko Yamato'));
  const gn98 = trip.findIndex(s => s.includes('GN98'));
  assert(yamato >= 0 && gn98 > yamato, 'Hoy: Yamato debe ir antes del apartamento GN98');
  assert(nagoya.hotelStart.includes('SUI') && nagoya.hotelEnd.includes('GN98'),
    '10/10: hotel origen Tokio y destino Osaka diferentes');
  assert(nagoya.stages.every(s => ['walk','transit','drive','mixed'].includes(s.mode)),
    '10/10: un tramo tiene modo inválido');
  assert(nagoya.stages.some(s => s.stops.some(p => p.query === '34.668712,135.485405')),
    'GN98: no se usan coordenadas verificadas');
  assert(nagoya.stages.at(-1).stops.at(-1).title.includes('GN98'),
    'La ruta del día debe terminar en GN98, no en Dōtonbori');
  assert(!nagoya.stages.some(s => s.id === 'noche-osaka'),
    'Hoy no puede aparecer un tramo nocturno cancelado');
}
// Imprescindibles de Osaka antes de viajar a Kioto.
const sunday = get('2026-10-11');
if (sunday) {
  const ids = sunday.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['namba-yasaka', 'shinsekai', 'tsutenkaku-1011', 'dotonbori']) {
    assert(ids.includes(id), 'Domingo 11: falta imprescindible ' + id);
  }
  assert(!ids.includes('sumiyoshi'), 'Sumiyoshi se queda opcional para no quitar tiempo');
  assert(sunday.stages.at(-1).stops.at(-1).kind === 'hotel', 'Domingo debe terminar en GN98');
}
const monday = get('2026-10-12');
if (monday) {
  const ids = monday.stages.flatMap(s => s.stops.map(p => p.id));
  assert(ids.includes('osaka-castle') && ids.includes('umeda-sky'),
    'Lunes 12: deben estar el castillo de Osaka y Umeda Sky');
  assert(monday.stages.at(-1).stops.at(-1).kind === 'hotel', 'Lunes debe terminar en GN98');
}
// Domingo temprano: tsutenkaku solo desde fuera, sin mirador ni entradas.
const osakaSegment = segments.find(seg => seg.hotel?.name === 'GN98 Saiwaicho');
if (osakaSegment) {
  const sundayDay = osakaSegment.days.find(day => day.date === '2026-10-11');
  const mondayDay = osakaSegment.days.find(day => day.date === '2026-10-12');
  const getActivity = (day, id) => day?.activities.find(a => a.id === id);
  assert(getActivity(sundayDay, 'salida-gn98-0745-1011')?.time === '07:45',
    'Domingo 11: salida del alojamiento debe figurar a las 07:45');
  assert(getActivity(sundayDay, 'namba-yasaka')?.time === '~08:45–09:15' &&
    getActivity(sundayDay, 'namba-yasaka')?.notes?.includes('09:00'),
    'Namba Yasaka: 30 minutos en el santuario, con goshuin desde las 09:00');
  assert(getActivity(sundayDay, 'desayuno-namba-1011')?.time === '~08:10–08:35',
    'Antes del santuario, desayuno por Namba en lugar de esperar 1 hora');
  const buySky = getActivity(sundayDay, 'comprar-entradas-umeda-sky-1012');
  const sky = getActivity(mondayDay, 'umeda-sky');
  assert(buySky?.status === 'plan' && buySky?.links?.reservation?.includes('asoview.com'),
    'Las entradas Umeda Sky deben figurar pendientes y con compra directa');
  assert(sky?.links?.reservation?.includes('asoview.com') &&
    sky?.notes?.includes('No consta ninguna compra'),
    'Mirador Umeda: botón de reserva oficial sin inventar entradas compradas');
  assert(sky?.notes?.includes('17:28'),
    'Atardecer Umeda del 12/10 es a las 17:28 y debe figurar en el planning');
  const tower = getActivity(sundayDay, 'tsutenkaku-1011');
  assert(tower?.notes?.includes('No vamos a subir') && tower?.category !== 'mirador',
    'Tsutenkaku: se ve por fuera, no hay entradas ni subida');
  assert(getActivity(mondayDay, 'salida-gn98-0745-1012')?.time === '07:45',
    'Lunes 12: salida temprana a las 07:45');
  assert(getActivity(mondayDay, 'osaka-castle-park-early-1012')?.time === '~08:25',
    'Castillo Osaka: ver parque antes de abrir a las 09:00');
}
const transfer = get('2026-10-13');
if (transfer) {
  assert(transfer.hotelStart.includes('GN98') && transfer.hotelEnd.includes('RESI STAY'),
    '13/10: Osaka -> Kioto no tiene hoteles correctos');
}
for (const day of dates) {
  assert(day.stages.length > 0, day.date + ': sin tramos');
  for (const stage of day.stages) {
    // Algunos días solo tienen una visita localizada (o están por completar).
    // Mantener un marcador aislado es correcto; inventar un segundo punto no.
    assert(stage.stops.length >= 1, day.date + ': tramo sin ubicaciones ' + stage.id);
    for (const stop of stage.stops) {
      assert(Boolean(stop.query), day.date + ': parada sin destino ' + stop.title);
    }
  }
}
// Regresión real reportada desde Android: plegar Shichifukujin ocultaba
// las paradas intermedias del mapa y suprimía incluso la línea completa.
const mapSource = readFileSync('src/pages/mapas.astro', 'utf8');
assert(mapSource.includes('for (const stage of stages) for (const point of stage.stops)'),
  'El mapa debe localizar las paradas reales de cada tramo, no solo las mostradas en la lista');
assert(!mapSource.includes('stage.expandable && shown(stage).length < stage.stops.length)) continue'),
  'Plegar la lista NO debe impedir trazar las líneas del mapa');
assert(mapSource.includes('[...stage.stops, stage.stops[0]]'),
  'Los circuitos como Shichifukujin deben cerrar la ruta en el punto de salida');
assert(mapSource.includes("dashArray: '7 9'") &&
  mapSource.includes("Conexión orientativa · no sigue las calles"),
  'Si falla el motor de rutas, debe quedar visible la unión orientativa, a trazos');
assert(mapSource.includes('fallbacks.forEach(line => { line.remove(); provisionalLines--; })'),
  'El recorrido real debe reemplazar las conexiones provisionales cuando se pueda');
assert(mapSource.includes("distanceKm(from, to) > 25"),
  'No dibujar falsas líneas de tren entre ciudades');

// Regresión: antes un botón enviaba TODOS los waypoints a Google Maps.
// La lista plegada no debe alterar las paradas de navegación.
assert(mapSource.includes("function fullGoogleRoute(stage)"),
  'Falta la navegación completa de Google Maps');
assert(mapSource.includes("const middle = queries.slice(1, -1).join('|')") &&
  mapSource.includes("url += '&waypoints=' + encodeURIComponent(middle)"),
  'Google Maps debe recibir TODOS los waypoints, no solo origen/destino');
assert(mapSource.includes("[...stage.stops, stage.stops[0]]"),
  'La ruta circular debe regresar al inicio en Google Maps');
assert(mapSource.includes("esc(fullGoogleRoute(stage))") &&
  mapSource.includes("🧭 Abrir ruta completa en Google Maps"),
  'Falta el botón por tramo para abrir ruta completa');
assert(mapSource.includes('id="active-stage-google-route"') &&
  mapSource.includes("activeRouteButton.href = fullGoogleRoute(single)"),
  'Falta el botón junto al mapa al seleccionar un tramo');
if (asakusa) {
  const shichi = asakusa.stages.find(s => s.id === 'shichifukujin');
  if (shichi) {
    const waypoints = shichi.stops.map(s => s.query);
    assert(waypoints.length === 9 && shichi.closeLoop,
      'La ruta Google Maps de los nueve templos debe volver al inicio');
    assert(waypoints.slice(1).length === 8, 'Los ocho templos restantes deben ser waypoints');
  }
}

// No es una función especial de Shichifukujin: toda ruta del itinerario
// debe ofrecer navegación con TODOS los puntos del tramo.
assert(mapSource.includes("function drawGoogleRoutes(route, stages)") &&
  mapSource.includes("drawGoogleRoutes(route, stages);"),
  'El mapa completo debe listar enlaces Google Maps para cada tramo');
assert(mapSource.includes("stages.forEach(stage => {") &&
  mapSource.includes("link.href = fullGoogleRoute(stage)"),
  'Los enlaces de ruta completa deben generarse para CADA tramo de CADA día');
assert(mapSource.includes("function wholeDayGoogleRoute(stages, route)") &&
  mapSource.includes("action.textContent = '🧭 Abrir día completo en Google Maps"),
  'Falta botón de día completo cuando el itinerario cabe en Maps');
assert(mapSource.includes('id="day-google-routes"'),
  'Falta la barra de navegación general situada encima del mapa');
assert(mapSource.includes("stops.at(-1)?.query !== stop.query"),
  'Al unir tramos, los puntos repetidos consecutivos no deben duplicarse');
assert(mapSource.includes("if (stops.length < 2 || stops.length > 11) return null;"),
  'Los días muy largos deben conservar sus tramos en lugar de cortar visitas');
assert(mapSource.includes("stages.some(s => s.mode === 'mixed')"),
  'No lanzar una ruta de día completo engañosa cuando hay transportes mixtos');
for (const day of dates) {
  const stageLinks = day.stages.filter(s => s.stops.some(p => p.query));
  assert(stageLinks.length > 0,
    day.date + ': ningún tramo tiene paradas para enviar a Google Maps');
}
// Comprobar una ruta distinta de la peregrinación: Fuji y traslado a Osaka
assert(fuji?.stages.some(s => s.id === 'fuji' && s.stops.length >= 9),
  'Google Maps también debe ofrecer la ruta de aparcamientos del Fuji');
assert(nagoya?.stages.some(s => s.id === 'nagoya' && s.stops.length >= 2),
  'Google Maps debe ofrecer el tramo de Nagoya, no solo Asakusa');

if (failures.length) {
  console.error('Fallo en el nuevo mapa:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('✓ Mapa validado: ' + dates.length + ' días, cuatro tramos en Asakusa y Nagoya; nueve templos Shichifukujin; Yamato -> GN98.');
