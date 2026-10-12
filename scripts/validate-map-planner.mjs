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
    sky?.notes?.includes('COMPRA AÚN NO CONFIRMADA'),
    'Umeda Sky: conservar enlace de compra sin dar entradas como compradas');
  assert(sky?.time === '~10:15–11:30' && !sky.notes?.includes('17:28'),
    'Umeda Sky: visita corta por la mañana, sin esperar al atardecer');
  // Cambio real del 11/10: comida confirmada a las 13:20, goshuin
  // antes del cierre de las 16:00 y Dotonbori a la tarde-noche.
  const ebisu = getActivity(sundayDay, 'kushikatsu-shinsekai-1011');
  const isshinji = getActivity(sundayDay, 'isshinji-goshuin-1011');
  const shiten = getActivity(sundayDay, 'shitennoji-goshuin-1011');
  const hozen = getActivity(sundayDay, 'hozenji-yokocho-1011');
  const doton = getActivity(sundayDay, 'dotonbori');
  assert(ebisu?.status === 'confirmado' && ebisu?.notes?.includes('13:20') &&
    ebisu?.address?.includes('恵美須東2-1-20'),
    'Shinsekai: restaurante exacto y comida todavía en curso a las 13:20');
  assert(isshinji?.time === '~14:05–14:30' && shiten?.time === '~14:45–15:40',
    'Templos de la tarde deben figurar antes de cerrar los goshuin');
  assert(isshinji?.goshuin && shiten?.goshuin && hozen?.goshuin &&
    [isshinji,shiten,hozen].every(t => t.status === 'plan' && t.description?.length >= 200),
    'Templos aún por hacer y con historia/goshuin previstos');
  assert(hozen?.time === '~16:10–16:45' && doton?.time === '~17:15–19:00',
    'Dotonbori debe ser DESPUÉS de todos los goshuin');
  const order = sundayDay.activities.map(a => a.id);
  assert(order.indexOf(ebisu.id) < order.indexOf(isshinji.id) &&
    order.indexOf(isshinji.id) < order.indexOf(shiten.id) &&
    order.indexOf(shiten.id) < order.indexOf(hozen.id) &&
    order.indexOf(hozen.id) < order.indexOf(doton.id),
    'Orden del planning: comida → Isshin-ji → Shitennoji → Hozenji → Dotonbori');
  assert(sundayDay.mapStages.some(t => t.id === 'templos-tarde' &&
    t.activityIds.includes('isshinji-goshuin-1011') &&
    t.activityIds.includes('shitennoji-goshuin-1011')),
    'Mapas: faltan nuevos templos y goshuin de la tarde');
  const tower = getActivity(sundayDay, 'tsutenkaku-1011');
  assert(tower?.notes?.includes('No vamos a subir') && tower?.category !== 'mirador',
    'Tsutenkaku: se ve por fuera, no hay entradas ni subida');
  assert(getActivity(mondayDay, 'salida-gn98-0745-1012')?.time === '07:45',
    'Lunes 12: salida temprana a las 07:45');
  assert(getActivity(mondayDay, 'osaka-castle-park-early-1012')?.time === '~08:25',
    'Castillo Osaka: ver parque antes de abrir a las 09:00');
  const castleMonday = getActivity(mondayDay, 'osaka-castle');
  assert(castleMonday?.notes?.includes('NO entrar al museo') &&
    castleMonday?.time === '~08:45–09:30',
    'Lunes 12: Castillo de Osaka solo por fuera; no entrar al museo');
  assert(!mondayDay.activities.some(a => a.id === 'umeda-grand-front-1012' || a.id === 'umeda-dinner-1012'),
    'Lunes 12: no dedicar toda la tarde a Umeda ni cenar obligatoriamente allí');
  assert(['osaka-shinsaibashi-shopping-1012','osaka-dotonbori-shopping-1012',
    'osaka-donki-dotonbori-1012'].every(id => getActivity(mondayDay,id)?.status === 'plan'),
    'Lunes 12: ropa, skincare y Donki forman el bloque principal de compras');
  assert(getActivity(mondayDay, 'osaka-comida-flex-1012')?.status === 'opcional' &&
    !getActivity(mondayDay, 'osaka-comida-flex-1012')?.time,
    'Lunes 12: no fijar una hora de comida');
  const shoppingStage = mondayDay.mapStages.find(st => st.id === 'compras-namba');
  assert(shoppingStage?.activityIds.includes('osaka-shinsaibashi-shopping-1012') &&
    shoppingStage.activityIds.includes('osaka-dotonbori-shopping-1012') &&
    shoppingStage.activityIds.includes('osaka-donki-dotonbori-1012') &&
    shoppingStage.activityIds.at(-1) === 'osaka-gn98-hacer-maletas-1012',
    'Mapa lunes: compras Shinsaibashi, Dotonbori y Donki → GN98 antes de enviar las maletas');
  const shippingStage = mondayDay.mapStages.find(st => st.id === 'yamato-envio-kyoto');
  assert(shippingStage?.activityIds.includes('yamato-osaka-kyoto-gion-send-1012') &&
    shippingStage.activityIds.at(-1) === '@hotel-end',
    'Mapa lunes: GN98 → Yamato → regreso GN98 antes de terminar el día');
}
// Festivo 12/10: compras de Donki ANTES de cerrar maletas y depositarlas
// con salida del día en Yamato Sakuragawa. Destino: Kyoto Gion 162620.
const monday12 = get('2026-10-12');
if (monday12) {
  const ids = monday12.stages.flatMap(stage => stage.stops.map(x => x.id));
  const donki = ids.indexOf('osaka-donki-dotonbori-1012');
  const pack = ids.indexOf('osaka-gn98-hacer-maletas-1012');
  const send = ids.indexOf('yamato-osaka-kyoto-gion-send-1012');
  assert(donki >= 0 && pack > donki && send > pack,
    '12/10: ruta debe pasar por Donki → preparar maletas GN98 → Yamato');
  assert(monday12.stages.some(stage => stage.id === 'yamato-envio-kyoto'),
    '12/10: falta tramo específico al Yamato desde el GN98');
  assert(monday12.stages.at(-1).stops.at(-1).kind === 'hotel',
    '12/10: ruta debe regresar al GN98 después de Yamato');
}
// Revisión completa Kioto 13–18. En el día 13 se superponen los segmentos
// Osaka y Kyoto: el mapa debe usar el origen GN98 y destino RESI Yasaka.
const kyoto13 = get('2026-10-13');
if (kyoto13) {
  assert(kyoto13.stages.length === 4, '13/10: cuatro tramos completos con llegada al hotel');
  assert(kyoto13.stages[0].stops[0].kind === 'hotel' &&
    kyoto13.stages[0].stops[0].title.includes('GN98'),
    '13/10: ruta empieza en el hotel de Osaka');
  assert(kyoto13.stages.at(-1).stops.at(-1).title.includes('RESI STAY Yasaka'),
    '13/10: ruta debe terminar en el hotel de Kioto');
  const ids = kyoto13.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['resi-recepcion-kioto-1013', 'kiyomizu', 'yasaka-pagoda',
    'yamato-kyoto-gion-pickup-1013', 'resi-yasaka-checkin-1013']) {
    assert(ids.includes(id), '13/10: falta el paso ' + id);
  }
  assert(kyoto13.hotelStart.includes('GN98') && kyoto13.hotelEnd.includes('RESI STAY'),
    '13/10: error en el cambio de hotel');
}
// 13/10: BUG REAL en «Hoy»: Osaka tenía una ficha antigua con un único
// traslado y Kioto tenía otra ficha con todas las visitas. El día debe existir
// una sola vez y conservar la ruta de Higashiyama y la recogida de la tarde.
const october13 = segments.flatMap(seg => seg.days.filter(d => d.date === '2026-10-13'));
assert(october13.length === 1 && october13[0]?.activities.length >= 10,
  '13/10: no duplicar una ficha vacía de Osaka que tape el planning de Kioto');
assert(october13[0]?.activities.some(a => a.id === 'kiyomizu') &&
  october13[0]?.activities.some(a => a.id === 'yamato-kyoto-gion-pickup-1013'),
  '13/10: en Hoy deben aparecer Kiyomizu y Yamato Gion');
if (kyoto13) {
  assert(kyoto13.stages.length === 4,
    '13/10: deben existir recepción, Higashiyama, llegada al hotel y maletas');
  const steps = kyoto13.stages.flatMap(st => st.stops.map(stop => stop.id));
  for (const id of ['kiyomizu', 'ninenzaka-sannenzaka','yasaka-pagoda',
    'comida-higashiyama-1013', 'yasaka', 'resi-yasaka-checkin-1013',
    'yamato-kyoto-gion-pickup-1013', 'gion']) {
    assert(steps.includes(id), '13/10: falta visita o trámite importante: '+id);
  }
  assert(kyoto13.stages[0].stops[0].title.includes('GN98'),
    '13/10: salir desde GN98, aunque ya no haya un día duplicado en Osaka');
  assert(kyoto13.stages.at(-1).stops.at(-1).kind === 'hotel',
    '13/10: la ruta termina en RESI STAY Yasaka');
  const hotelIndex = steps.indexOf('resi-yasaka-checkin-1013');
  const yamatoIndex = steps.indexOf('yamato-kyoto-gion-pickup-1013');
  assert(yamatoIndex >= 0 && hotelIndex > yamatoIndex,
    '13/10: recoger maletas en Yamato ANTES de entrar al apartamento, sin ir dos veces');
}
const sourceDays = readFileSync('src/lib/segments.ts', 'utf8');
assert(sourceDays.includes('grouped.get(key)!.push(entry)') &&
  sourceDays.includes('activities = entries.flatMap(entry => entry.day.activities)'),
  'La pantalla Hoy debe agrupar las fichas de origen/destino y mostrar todas las visitas');
for (const date of ['2026-10-20','2026-10-23']) {
  const matches = segments.flatMap(seg => seg.days.filter(d => d.date === date));
  assert(matches.length === 2, date + ': las etapas origen y destino deben conservarse');
}

const kyoto14 = get('2026-10-14');
if (kyoto14) {
  const ids = kyoto14.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['fushimi','sanjusangendo','nishiki','tobichi-kyoto','baikoan-matcha-2025'])
    assert(ids.includes(id), '14/10: falta imprescindible '+id);
}
const kyoto15 = get('2026-10-15');
if (kyoto15) {
  const ids = kyoto15.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['otagi','adashino','bamboo','tenryuji-1015','togetsukyo-1015','arashiyama-onsen'])
    assert(ids.includes(id), '15/10 Arashiyama: falta '+id);
  assert(ids.indexOf('arashiyama-onsen')>ids.indexOf('togetsukyo-1015'),
    '15/10: onsen después del puente');
}
const kyoto16 = get('2026-10-16');
if (kyoto16) {
  const ids = kyoto16.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['kofukuji','haru-nara','todaiji','kasuga'])
    assert(ids.includes(id), '16/10 Nara: falta '+id);
}
const kyoto17 = get('2026-10-17');
if (kyoto17) {
  const ids = kyoto17.stages.flatMap(s => s.stops.map(p => p.id));
  assert(ids.includes('kinkaku') && ids.includes('tatuajes-gion-1017'),
    '17/10: Kinkaku y tatuajes previstos con hueco por confirmar');
}
const kyoto18 = get('2026-10-18');
if (kyoto18) {
  const ids = kyoto18.stages.flatMap(s => s.stops.map(p => p.id));
  assert(ids.includes('ginkakuji') && ids.includes('kyoto-station-h2') && ids.includes('kix-vilma-marga'),
    '18/10: ruta del vuelo de Vilma y Marga');
}
// Día 13: salida real prevista a las 08:00. En Kyoto Station se hace el
// registro y se dejan bolsas, pero la habitación se ocupa más tarde.
// Yamato Kyoto Gion debe estar en el MISMO trayecto final al apartamento,
// nunca después de ir primero al hotel y volver a salir.
const kyotoSegment = segments.find(s => s.city === 'Kioto' || s.hotel?.name === 'RESI STAY Yasaka');
const kyotoDayLogistics13 = kyotoSegment?.days?.find(d => d.date === '2026-10-13');
assert(kyotoDayLogistics13?.activities.find(a => a.id === 'osaka-kyoto-tren-1013')?.time === '08:00 salida',
  '13/10: falta salida a las 08:00');
const reception13 = kyotoDayLogistics13?.activities.find(a => a.id === 'resi-recepcion-kioto-1013');
const room13 = kyotoDayLogistics13?.activities.find(a => a.id === 'resi-yasaka-checkin-1013');
assert(Boolean(reception13) && Boolean(room13), '13/10: faltan recepción y habitación separadas');
assert(reception13?.time?.startsWith('~09:45') && room13?.time?.startsWith('~16:30'),
  '13/10: hay que separar consigna matinal de entrada a la habitación');
const part13 = kyotoDayLogistics13?.mapStages?.find(s => s.id === 'yasaka-yamato-alojamiento');
assert(part13?.activityIds.indexOf('yamato-kyoto-gion-pickup-1013') >= 0 &&
  part13?.activityIds.indexOf('yamato-kyoto-gion-pickup-1013') <
  part13?.activityIds.indexOf('resi-yasaka-checkin-1013'),
  '13/10: Yamato Gion debe estar ANTES de entrar al alojamiento');
assert(kyotoDayLogistics13?.mapStages?.at(-1)?.activityIds.at(-1) === '@hotel-end',
  '13/10: la ruta debe terminar en el alojamiento de Kioto');
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
