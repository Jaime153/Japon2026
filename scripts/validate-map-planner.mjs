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
  assert(shichi?.stops.length === 9 && shichi?.expandable && shichi?.mode === 'walk',
    'Shichifukujin: deben estar los nueve templos a pie y desplegables');
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
  assert(nagoya.stages.length === 4, 'Viaje Nagoya/Osaka: deben ser cuatro tramos');
  const trip = nagoya.stages.flatMap(s => s.stops.map(p => p.title));
  const yamato = trip.findIndex(s => s.includes('Kuroneko Yamato'));
  const gn98 = trip.findIndex(s => s.includes('alojamiento GN98'));
  assert(yamato >= 0 && gn98 > yamato, 'Hoy: Yamato debe ir antes del apartamento GN98');
  assert(nagoya.hotelStart.includes('SUI') && nagoya.hotelEnd.includes('GN98'),
    '10/10: hotel origen Tokio y destino Osaka diferentes');
  assert(nagoya.stages.every(s => ['walk','transit','drive','mixed'].includes(s.mode)),
    '10/10: un tramo tiene modo inválido');
  assert(nagoya.stages.some(s => s.stops.some(p => p.query === '34.668712,135.485405')),
    'GN98: no se usan coordenadas verificadas');
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
if (failures.length) {
  console.error('Fallo en el nuevo mapa:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('✓ Mapa validado: ' + dates.length + ' días, cuatro tramos en Asakusa y Nagoya; nueve templos Shichifukujin; Yamato -> GN98.');
