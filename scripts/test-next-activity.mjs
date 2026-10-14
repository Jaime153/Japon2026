import { readFileSync } from 'node:fs';
import { japanClock, parseTimeWindow, selectNextActivity } from '../src/lib/next-activity.mjs';

const errors = [];
function check(value, message) { if (!value) errors.push(message); }
const at = time => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };

for (const [raw, start, end] of [
  ['08:30', 510, null], ['~19:00', 1140, null],
  ['~12:25–13:20', 745, 800], ['~10:00–10:50', 600, 650],
  ['13:20–14:20', 800, 860], ['~14:30-15:30', 870, 930],
]) {
  const result = parseTimeWindow(raw);
  check(result?.start === start && result?.end === end,
    'Interpretación incorrecta de ' + raw + ': ' + JSON.stringify(result));
}
for (const invalid of ['Opcional', 'Antes de 19:00', '12:07 llegada', 'Por reservar',
  '12:45 objetivo', '25:00', '~13:30–12:00', '08:68', '']) {
  check(parseTimeWindow(invalid) === null, 'No inventar hora para: ' + invalid);
}

const japan = japanClock(new Date('2026-10-14T03:34:00.000Z'));
check(japan.date === '2026-10-14' && japan.minutes === at('12:34'),
  'El reloj debe estar en Japón aunque el navegador use otro huso');

const segment = JSON.parse(readFileSync('src/content/segments/kyoto.json', 'utf8'));
const day = segment.days.find(day => day.date === '2026-10-14');
check(Boolean(day), 'Falta el día 14/10 en Kyoto');
if (day) {
  const activities = day.activities.map(a => ({
    id: a.id, title: a.title, time: a.time, status: a.status,
    skipped: Boolean(a.skipped), completed: false
  }));
  const ask = (time, expectedId, expectedKind) => {
    const item = selectNextActivity(activities, at(time));
    check(item.activity?.id === expectedId && item.kind === expectedKind,
      time + ': esperado ' + expectedId + '/' + expectedKind +
      ', encontrado ' + item.activity?.id + '/' + item.kind);
  };
  ask('09:45', 'ginkakuji', 'upcoming');
  ask('10:30', 'ginkakuji', 'active');
  ask('11:10', 'honenin-1014', 'active');
  ask('12:00', 'philosophers-path', 'active');
  ask('12:34', 'eikando-1014', 'active'); // Captura real del usuario.
  ask('13:20', 'comer-higashiyama-noreste-1014', 'upcoming');
  ask('14:22', 'comer-higashiyama-noreste-1014', 'active'); // Comida real desde ~14:12.
  ask('14:40', 'comer-higashiyama-noreste-1014', 'active'); // Salida del café no confirmada.
  ask('15:15', 'nanzenji-1014', 'active'); // Presencia REAL comunicada en Nanzen-ji.
  ask('15:30', 'nanzenji-1014', 'active'); // Fin 16:10 solo estimado.
  ask('16:20', 'regreso-resi-1014', 'upcoming'); // Heian aún no confirmado; opcional.
  ask('17:30', 'regreso-resi-1014', 'active');
  const late = selectNextActivity(activities, at('19:00'));
  check(late.kind === 'finished' && !late.activity,
    'Gion Tanto es opcional, no la próxima parada automática');
  const eikandoDone = activities.map(a => a.id === 'eikando-1014' ? {...a, completed: true} : a);
  check(selectNextActivity(eikandoDone, at('12:34')).activity?.id === 'comer-higashiyama-noreste-1014',
    'Marcar Eikan-dō como hecho debe pasar a la comida, sin adelantar Heian');
  const lunch = activities.find(a => a.id === 'comer-higashiyama-noreste-1014');
  check(parseTimeWindow(lunch?.time)?.start === at('14:12') &&
        parseTimeWindow(lunch?.time)?.end === at('14:45') &&
        lunch?.status === 'confirmado',
    'Hora real de inicio de la comida y final solo estimado deben estar anotados');
  const nanzen = activities.find(a => a.id === 'nanzenji-1014');
  check(parseTimeWindow(nanzen?.time)?.start === at('15:15') &&
        parseTimeWindow(nanzen?.time)?.end === at('16:10') &&
        nanzen?.status === 'confirmado',
    'Nanzen-ji real 15:15; fin estimado 16:10 y actividad visible en Hoy');
  check(activities.find(a => a.id === 'heian-jingu-1014')?.status === 'opcional',
    'Heian no debe aparecer como visita hecha ni como siguiente automática');
  const noOptionals = selectNextActivity([
    {id:'solo-opcional',time:'~19:00',status:'opcional'},
    {id:'otro-saltado',time:'~14:30–15:30',status:'plan',skipped:true},
  ], at('12:34'));
  check(noOptionals.kind === 'empty', 'Opcionales y descartados no deben aparecer como Siguiente');
  const untimed = selectNextActivity([
    {id:'sin-hora',status:'plan',completed:false},
    {id:'opcional-tarde',status:'opcional',time:'21:00'},
  ], at('18:45'));
  check(untimed.kind === 'untimed' && untimed.activity.id === 'sin-hora',
    'Si hay una parada principal sin hora, no elegir el opcional nocturno');
}

const page = readFileSync('src/pages/hoy.astro', 'utf8');
const card = readFileSync('src/components/ActivityCard.astro', 'utf8');
check(page.includes('selectNextActivity(pending, japanClock().minutes)'),
  'La tarjeta Hoy debe usar el selector de franjas en hora japonesa');
check(card.includes('data-activity-status={activity.status}') &&
      card.includes("data-activity-skipped={activity.skipped ? 'true' : 'false'}"),
  'Se necesita estado y descarte para no elegir actividades opcionales');
check(page.includes("selection.kind === 'active'"),
  'La tarjeta debe indicar cuándo estamos dentro de una franja');
check(page.includes('setInterval(') && page.includes('refreshNext(entry)'),
  'La siguiente parada debe actualizarse cuando avance la hora');
if (errors.length) {
  console.error('\n❌ Regresiones en tarjeta Hoy:\n- ' + errors.join('\n- '));
  process.exit(1);
}
console.log('✓ Siguiente parada verificada con horas sueltas, rangos, JST y día 14/10.');
