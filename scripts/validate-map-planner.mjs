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
  // Salida acordada con el grupo: 08:30. No adelantarla unilateralmente.
  assert(getActivity(sundayDay, 'salida-gn98-0830-1011')?.time === '08:30',
    'Domingo 11: salida acordada del GN98 a las 08:30');
  assert(getActivity(sundayDay, 'namba-yasaka')?.time === '~09:00–09:30' &&
    getActivity(sundayDay, 'namba-yasaka')?.notes?.includes('09:00'),
    'Namba Yasaka: ir tras salir a las 08:30 y pedir goshuin desde las 09:00');
  assert(getActivity(sundayDay, 'desayuno-namba-1011')?.status === 'opcional' &&
    !getActivity(sundayDay, 'desayuno-namba-1011')?.time,
    'Domingo: no fijar desayuno antes de la salida del GN98 a las 08:30');
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
  assert(kyoto13.stages.length === 3, '13/10: tras Kōdai-ji no hubo más visitas: solo tres tramos');
  assert(kyoto13.hotelStart.includes('GN98') && kyoto13.hotelEnd.includes('RESI STAY'),
    '13/10: origen Osaka, destino Kioto');
  assert(kyoto13.stages[0].stops[0].query === '34.668712,135.485405',
    '13/10: el traslado debe empezar en GN98, sin generar otro hotel falso');
  assert(kyoto13.stages.at(-1).stops.at(-1).kind === 'hotel',
    '13/10: terminamos en RESI STAY Yasaka');
  const ids = kyoto13.stages.flatMap(s => s.stops.map(p => p.id));
  const visited = ['resi-yasaka-llegada-maletas-1045-1013','yasaka-koshindo-1013',
    'ryozen-kannon-1013','kodaiji-1013-optional'];
  for (const id of visited) assert(ids.includes(id), '13/10: falta visita realizada: ' + id);
  for (const id of ['nene-no-michi-1013','maruyama-park-1013','yasaka','chionin',
    'resi-yasaka-checkin-1013']) {
    assert(!ids.includes(id), '13/10: incluir solo visitas hechas, no ' + id);
  }
  assert(visited.every((id, i) => i === 0 || ids.indexOf(visited[i - 1]) < ids.indexOf(id)),
    '13/10: respetar orden de llegada a Kioto y Kōdai-ji');
  for (const id of ['resi-recepcion-kioto-1013','yamato-kyoto-gion-pickup-1013',
    'kiyomizu','ninenzaka-sannenzaka','yasaka-pagoda']) {
    assert(!ids.includes(id), '13/10: parada condicional o pospuesta no debe imponerse: ' + id);
  }
}
// 13/10: BUG REAL en «Hoy»: Osaka tenía una ficha antigua con un único
// traslado y Kioto tenía otra ficha con todas las visitas. El día debe existir
// una sola vez y conservar la ruta de Higashiyama y la recogida de la tarde.
const october13 = segments.flatMap(seg => seg.days.filter(d => d.date === '2026-10-13'));
assert(october13.length === 1 && october13[0]?.activities.length >= 15,
  '13/10: solo una ficha completa del día, no duplicar traslado desde Osaka');
if (october13.length === 1) {
  const activities = october13[0].activities;
  const get13 = id => activities.find(a => a.id === id);
  assert(get13('yasaka-koshindo-1013')?.status === 'confirmado',
    '13/10: visita confirmada al templo Kōshin-dō');
  assert(get13('ryozen-kannon-1013')?.time === '12:21' &&
    get13('ryozen-kannon-1013')?.status !== 'confirmado',
    '13/10: llegada a Ryōzen Kannon confirmada, visita aún en curso');
  assert(get13('resi-yasaka-llegada-maletas-1045-1013')?.status === 'confirmado',
    '13/10: llegada al alojamiento y maletas 10:45 confirmadas');
  assert(get13('chionin')?.skipped === true && get13('yasaka')?.skipped === true,
    '13/10: Yasaka y Chion-in no se visitaron después de Kōdai-ji');
  assert(get13('heian-jingu-1013-extra')?.status === 'opcional',
    '13/10: Heian Jingū solo si queda tarde y no urge Yamato');
  assert(get13('yamato-kyoto-gion-pickup-1013')?.status === 'opcional' &&
    get13('yamato-kyoto-gion-pickup-1013')?.notes?.includes('seguimiento'),
    '13/10: recoger maletas únicamente si el seguimiento las confirma');
  assert(!activities.some(a => ['kiyomizu','ninenzaka-sannenzaka','yasaka-pagoda'].includes(a.id)),
    '13/10: Kiyomizu-dera y fotos siguen para 18/10');
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
  for (const id of ['ginkakuji','honenin-1014','philosophers-path','eikando-1014','nanzenji-1014','heian-jingu-1014'])
    assert(ids.includes(id), '14/10 noreste: falta imprescindible '+id);
  assert(!ids.includes('fushimi'), '14/10: Fushimi al amanecer otro día, no hoy');
  assert(kyoto14.stages[0].stops.at(-1)?.id === 'ginkakuji',
    '14/10: el primer destino debe ser Ginkaku-ji');
  assert(kyoto14.stages.at(-1).stops.at(-1).kind === 'hotel',
    '14/10: ruta de norte a sur termina en RESI Yasaka');
}
// 15/10 compactado: Kinkaku + Arashiyama corto + onsen, sin templos lejanos.
// Se libera el 17 para Kiyomizu en kimono y ceremonia con las cuatro.
const kyoto15 = get('2026-10-15');
if (kyoto15) {
  const ids = kyoto15.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['kinkaku','bamboo','arashiyama-comida-1015','togetsukyo-1015','arashiyama-onsen'])
    assert(ids.includes(id), '15/10 compactado: falta visita principal '+id);
  for (const id of ['otagi','adashino','ryoanji','ninnaji','tenryuji-1015'])
    assert(!ids.includes(id), '15/10: se ha colado templo opcional que recorta el onsen: '+id);
  assert(ids.indexOf('kinkaku') < ids.indexOf('bamboo') &&
    ids.indexOf('bamboo') < ids.indexOf('togetsukyo-1015') &&
    ids.indexOf('togetsukyo-1015') < ids.indexOf('arashiyama-onsen'),
    '15/10: orden debe ser Kinkaku → bambú → puente → onsen');
  assert(kyoto15.stages[0].stops[0].kind === 'hotel' &&
    kyoto15.stages.at(-1).stops.at(-1).kind === 'hotel',
    '15/10: salida y regreso al alojamiento');
  const kyotoData = segments.find(seg => seg.city === 'Kioto' || seg.city === 'Kyoto');
  const day = kyotoData?.days.find(x => x.date === '2026-10-15');
  assert(day?.activities.find(a => a.id === 'arashiyama-onsen')?.priority === 'must',
    '15/10: onsen imprescindible para el grupo');
  const choice = day?.activities.find(a => a.id === 'arashiyama-onsen')?.bathChoices;
  assert(choice?.defaultId === 'private' && choice?.options?.length === 3,
    '15/10: el selector debe tener exactamente tres modalidades y privado por defecto');
  assert(['tattoo-friendly','covered','private'].every(id =>
    choice?.options?.some(option => option.id === id)),
    '15/10: falta modalidad: tatuajes admitidos, tapados o privado');
  assert(choice?.options?.find(o=>o.id==='tattoo-friendly')?.venue==='Kurama Onsen',
    '15/10: la opción oficialmente tattoo friendly debe ser Kurama');
  assert(choice?.options?.find(o=>o.id==='private')?.confirmed===false &&
    choice?.options?.find(o=>o.id==='covered')?.confirmed===false,
    '15/10: no prometer política ni reserva privada, ni uso de día en Ohara');
  assert(!day?.activities.find(a => a.id === 'arashiyama-onsen')?.locationQuery.includes('Fufu'),
    '15/10: no enviar al grupo a Fufu no Yu, que prohíbe tatuajes');
  assert(ids.indexOf('togetsukyo-1015') < ids.indexOf('arashiyama-comida-1015'),
    '15/10: puente antes de almuerzo y onsen (Hanaikada pide comer antes)');
  assert(day?.activities.find(a => a.id === 'arashiyama-onsen')?.time==='Según reserva',
    '15/10: no inventar horario para baño sin reserva');
  assert(day?.activities.find(a => a.id === 'tenryuji-1015')?.status === 'opcional',
    '15/10: Tenryu-ji no puede imponerse');
}
const kyoto16 = get('2026-10-16');
if (kyoto16) {
  const ids = kyoto16.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['fushimi','kofukuji','haru-nara','todaiji','kasuga'])
    assert(ids.includes(id), '16/10 Fushimi/Nara: falta '+id);
  assert(ids.indexOf('fushimi') < ids.indexOf('kofukuji') &&
    ids.indexOf('kofukuji') < ids.indexOf('haru-nara'),
    '16/10: Fushimi al amanecer, luego Kofuku-ji y Yoshoku Haru');
}
const kyoto17 = get('2026-10-17');
if (kyoto17) {
  const ids = kyoto17.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['kimono-te-kiyomizu-1017','kiyomizu-1017','ninenzaka-palillos-fotos-1017','yasaka-pagoda-fotos-1017']) {
    assert(ids.includes(id), '17/10: faltan kimono, té, Kiyomizu o fotos para las cuatro: '+id);
  }
  assert(!ids.includes('kinkaku') && !ids.includes('tatuajes-gion-1017'),
    '17/10: no volver a meter Kinkaku ni tatuajes sin cita confirmada en la ruta principal');
  const kyotoData = segments.find(seg => seg.city === 'Kioto' || seg.city === 'Kyoto');
  const day = kyotoData?.days.find(x => x.date === '2026-10-17');
  assert(day?.activities.find(a => a.id === 'tatuajes-gion-1017')?.status === 'pendiente',
    '17/10: conservar interés por tatuajes, pero SIN reserva');
  assert(day?.activities.find(a => a.id === 'kimono-te-kiyomizu-1017')?.notes.includes('no confirmada'),
    '17/10: NO inventar reserva de kimono/ceremonia');
  assert(kyoto17.stages.at(-1).stops.at(-1).kind === 'hotel',
    '17/10: volver a RESI tras Kiyomizu');
}
const kyoto18 = get('2026-10-18');
if (kyoto18) {
  const ids = kyoto18.stages.flatMap(s => s.stops.map(p => p.id));
  assert(ids.includes('kyoto-station-h2') && ids.includes('kix-vilma-marga'),
    '18/10: conservar salida H2/KY2 y vuelo KIX de las 19:00');
  assert(!['kiyomizu-1018','ninenzaka-palillos-fotos-1018','yasaka-pagoda-fotos-1018']
    .some(id => ids.includes(id)),
    '18/10: no meter visita exigente antes de vuelo y maletas');
  const kyotoData = segments.find(seg => seg.city === 'Kioto' || seg.city === 'Kyoto');
  const day = kyotoData?.days.find(x => x.date === '2026-10-18');
  assert(day?.activities.find(a => a.id === 'kyoto-station-h2')?.status !== 'confirmado',
    '18/10: parada confirmada pero autobús 14:20 sigue sin billete');
  assert(day?.activities.find(a => a.id === 'kix-vilma-marga')?.time === '19:00',
    '18/10: conservar vuelo a KIX a las 19:00');
}
const kyoto19 = get('2026-10-19');
if (kyoto19) {
  const ids = kyoto19.stages.flatMap(s => s.stops.map(p => p.id));
  for (const id of ['sanjusangendo','nishiki','tobichi-kyoto','baikoan-matcha-2025'])
    assert(ids.includes(id), '19/10: falta visita o compra pendiente '+id);
  assert(!ids.includes('ginkakuji'), '19/10: no repetir el Ginkaku ya previsto para las cuatro personas el 14');
  assert(kyoto19.stages.at(-1).stops.at(-1).kind === 'hotel',
    '19/10: volver a RESI STAY desde la ruta de Ginkaku');
}
// Día 13: salida real prevista a las 08:00. En Kyoto Station se hace el
// registro y se dejan bolsas, pero la habitación se ocupa más tarde.
// La planificación anterior tenía horas previstas, pero el viaje ya ocurrió.
// Ahora la realidad manda: llegada a RESI a las 10:45, registro por comprobar,
// recogida Yamato condicional (no dibujar desvíos como obligatorios).
const kyotoSegment = segments.find(s => s.city === 'Kioto' || s.hotel?.name === 'RESI STAY Yasaka');
const kyotoDayLogistics13 = kyotoSegment?.days?.find(d => d.date === '2026-10-13');
const outbound13 = kyotoDayLogistics13?.activities.find(a => a.id === 'osaka-kyoto-tren-1013');
const arrived13 = kyotoDayLogistics13?.activities.find(a => a.id === 'resi-yasaka-llegada-maletas-1045-1013');
const reception13 = kyotoDayLogistics13?.activities.find(a => a.id === 'resi-recepcion-kioto-1013');
const room13 = kyotoDayLogistics13?.activities.find(a => a.id === 'resi-yasaka-checkin-1013');
assert(outbound13?.status === 'confirmado' && !outbound13?.time,
  '13/10: traslado realizado pero no inventar hora real del tren');
assert(arrived13?.time === '10:45' && arrived13?.status === 'confirmado',
  '13/10: RESI Yasaka llegó y dejó maletas a las 10:45');
assert(reception13?.status === 'pendiente' && !reception13?.time &&
  room13?.time === 'Desde 15:00',
  '13/10: separar llegada, registro pendiente y entrada en habitación');
assert(kyotoDayLogistics13?.mapStages?.at(-1)?.activityIds.at(-1) === '@hotel-end',
  '13/10: el mapa debe terminar en RESI STAY Yasaka');
assert(!kyotoDayLogistics13?.mapStages?.some(s => s.activityIds.includes('yamato-kyoto-gion-pickup-1013')),
  '13/10: no imponer recogida Yamato hasta confirmación del seguimiento');
// Kioto 13-14: Kōdai-ji fue la última visita real del 13.
// El 14 se organiza la ruta del norte; no marcarla como visitada.
const kyotoSeg = segments.find(seg => seg.city === 'Kioto' || seg.city === 'Kyoto');
const tue = kyotoSeg?.days.find(day => day.date === '2026-10-13');
const wed = kyotoSeg?.days.find(day => day.date === '2026-10-14');
assert(Boolean(tue) && Boolean(wed), 'Faltan días 13 y 14 de Kioto');
if (tue) {
  assert(tue.activities.find(a => a.id === 'kodaiji-1013-optional')?.status === 'confirmado',
    '13/10: Kōdai-ji fue visitado');
  for (const id of ['yasaka', 'chionin', 'maruyama-park-1013', 'nene-no-michi-1013']) {
    assert(tue.activities.find(a => a.id === id)?.skipped === true,
      '13/10: ' + id + ' no se visitó después de Kōdai-ji');
  }
}
if (wed) {
  const order = ['salida-resi-0830-1014', 'ginkakuji', 'honenin-1014',
    'philosophers-path', 'eikando-1014', 'comer-higashiyama-noreste-1014',
    'nanzenji-1014', 'heian-jingu-1014'];
  assert(wed.activities.slice(0, order.length).map(a => a.id).join(',') === order.join(','),
    '14/10: Nanzen-ji a las 15:15 tras el café; Heian solo si queda pendiente');
  assert(wed.activities.find(a => a.id === 'salida-resi-0830-1014')?.time === '08:30' &&
    wed.activities.find(a => a.id === 'salida-resi-0830-1014')?.status === 'confirmado',
    '14/10: salida real 08:30 debe quedar confirmada');
  assert(wed.activities.find(a => a.id === 'salida-resi-0830-1014')?.notes.includes('09:15') &&
    wed.activities.find(a => a.id === 'salida-resi-0830-1014')?.notes.includes('09:44'),
    '14/10: mantener autobús real 09:15 y ETA 09:44, no llegada confirmada');
  assert(wed.activities.find(a => a.id === 'ginkakuji')?.time === '~10:00–10:50' &&
    wed.activities.find(a => a.id === 'ginkakuji')?.status === 'plan',
    '14/10: no convertir Ginkaku en visita hecha sin aviso');
  const lunch = wed.activities.find(a => a.id === 'comer-higashiyama-noreste-1014');
  assert(lunch?.status === 'confirmado' && lunch?.time === '~14:12–14:45',
    '14/10: cafe LCM ~14:12 y final estimado ~14:45, no comida a las 15:15');
  assert(lunch?.notes.includes('NO una hora de salida confirmada') &&
    lunch?.notes.includes('14:22'),
    '14/10: no inventar fin real de la comida, conservar dato de las 14:22');
  assert(lunch?.locationQuery.includes('cafe LCM') && lunch?.address.includes('夷町159'),
    '14/10: cafe LCM es el de Jingūmichi');
  const nanzen = wed.activities.find(a => a.id === 'nanzenji-1014');
  assert(nanzen?.status === 'confirmado' && nanzen?.time === '15:15' &&
    nanzen?.notes.includes('hora REAL') && nanzen?.notes.includes('SALIDO') && nanzen?.notes.includes('ESTIMADO'),
    '14/10: Nanzen-ji presencia real 15:15; salida confirmada pero SIN hora real');
  const heian = wed.activities.find(a => a.id === 'heian-jingu-1014');
  assert(heian?.status === 'plan' && heian?.notes.includes('vamos de camino') &&
    heian?.notes.includes('17:30') && heian?.notes.includes('17:00'),
    '14/10: en camino a Heian, SIN llegada confirmada; respetar cierres');
  assert(wed.activities.find(a => a.id === 'yasaka-gion-tarde-1014')?.status === 'opcional' &&
    wed.activities.find(a => a.id === 'regreso-resi-1014')?.notes.includes('No hay llegada al hotel confirmada'),
    '14/10: paseo por Yasaka/Gion, sin vuelta absurda al hotel antes de cenar');
  assert(!wed.activities.find(a => a.id === 'philosophers-path')?.plan.some(p => /Hora límite: empezar regreso/.test(p)),
    '14/10: no introducir regreso al hotel antes de terminar los templos');
  assert(!wed.activities.some(a => a.id === 'fushimi'),
    '14/10: Fushimi Inari es otro día');
  const mapped = get('2026-10-14');
  assert(mapped?.stages?.[2]?.stops?.map(p => p.id).join(',') ===
    'eikando-1014,comer-higashiyama-noreste-1014,nanzenji-1014',
    '14/10: mapa Eikan-dō → cafe LCM → Nanzen-ji');
  assert(mapped?.stages?.[3]?.stops?.map(p => p.id).join(',') ===
    'nanzenji-1014,heian-jingu-1014,yasaka-gion-tarde-1014,@hotel-end',
    '14/10: mapa Nanzen → Heian → Yasaka/Gion → RESI sin retorno intermedio');
  assert(mapped?.stages?.[0]?.stops?.some(p => p.id === 'ginkakuji'),
    '14/10: el primer templo debe ser Ginkaku-ji');
  assert(mapped?.stages?.at(-1)?.stops?.some(p => p.kind === 'hotel'),
    '14/10: regreso al alojamiento conservado');
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

const cardsSource = readFileSync('src/components/ActivityCard.astro', 'utf8');
assert(cardsSource.includes('data-bath-selector') &&
  cardsSource.includes('data-bath-choice') && cardsSource.includes('data-bath-panel'),
  'La ficha Hoy debe tener selector y paneles de opciones para el onsen');
assert(cardsSource.includes('japon2026:bath-option:') &&
  cardsSource.includes('localStorage.setItem(bathKey, choice)'),
  'La elección del baño debe persistir de Hoy a Mapa');
assert(mapSource.includes('japon2026:bath-option:') &&
  mapSource.includes('chosen.locationQuery'),
  'El mapa debe usar la ubicación de la modalidad de onsen elegida');
assert(!cardsSource.includes('Toca para ver qué hacer y acciones') ||
  cardsSource.includes('bathChoices'),
  'La ficha de onsen debe poder abrirse para cambiar de modalidad');

if (failures.length) {
  console.error('Fallo en el nuevo mapa:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('✓ Mapa validado: ' + dates.length + ' días, cuatro tramos en Asakusa y Nagoya; nueve templos Shichifukujin; Yamato -> GN98.');
