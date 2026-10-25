/**
 * Validaciones de contenido y maquetación críticas para el móvil.
 * Se ejecuta automáticamente en npm run build (CI y GitHub Pages).
 * Sin dependencias adicionales: solo Node.js.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const folder = 'src/content/segments';
const errors = [];
let days = 0;
let temples = 0;
let activities = 0;

function checkActivities(items, where) {
  const seen = new Set();
  for (const activity of items ?? []) {
    activities++;
    if (seen.has(activity.id)) errors.push(`${where}: ID repetido ${activity.id}`);
    seen.add(activity.id);
    const time = activity.time ?? '';
    if (typeof time !== 'string' || time.length > 16) {
      errors.push(`${where}/${activity.id}: banner de hora de más de 16 caracteres (${JSON.stringify(time)}). Mover el detalle a observaciones.`);
    }
    if (activity.category === 'templo') {
      temples++;
      if (typeof activity.description !== 'string' || activity.description.trim().length < 200) {
        errors.push(`${where}/${activity.id}: falta historia y significado (mínimo 200 caracteres).`);
      }
    }
  }
}

for (const filename of readdirSync(folder).filter((f) => f.endsWith('.json'))) {
  const segment = JSON.parse(readFileSync(join(folder, filename), 'utf8'));
  for (const day of segment.days ?? []) {
    days++;
    checkActivities(day.activities, `${filename} ${day.date}`);
  }
  for (const alternative of segment.candidateModules ?? []) {
    checkActivities(alternative.activities, `${filename} plan alternativo ${alternative.id}`);
  }
}

// Kobe 25/10: proteger los pines de los destinos que antes abrían estaciones
// o comercios con el mismo nombre. Los strings son latitud,longitud WGS84.
const kobeSegment = JSON.parse(readFileSync('src/content/segments/osaka-2.json', 'utf8'));
const kobeDay = kobeSegment.days.find(d => d.date === '2026-10-25');
if (!kobeDay) {
  errors.push('25/10: falta la jornada de Kobe');
} else {
  const kobeById = new Map(kobeDay.activities.map(a => [a.id, a]));
  const exactKobe = {
    'ida-kobe-1025': '34.69486,135.19509',
    'kitano-1025': '34.70126,135.18973',
    'ikuta-jinja-1025': '34.6946102,135.1906166',
    'galerias-1025': '34.688894,135.189566',
    'nankinmachi-1025': '34.6882163,135.1881583',
    'meriken-1025': '34.683722,135.190217',
    'harborland-1025': '34.6796142,135.1845690',
    'nunobiki-noche-1025': '34.7043632,135.1937926',
  };
  for (const [id, pin] of Object.entries(exactKobe)) {
    if (kobeById.get(id)?.locationQuery !== pin) errors.push(`25/10 ${id}: pin GPS cambiado o sustituido por búsqueda ambigua`);
  }
  const gallery = kobeById.get('galerias-1025');
  if (!gallery?.plan?.[1]?.includes('Maps: «34.688894,135.189566»') ||
      gallery?.plan?.some(s => /Maps: «JR元町駅/.test(s))) {
    errors.push('25/10: el botón Maps del arco Motomachi debe ir a coordenadas, NO a JR Motomachi');
  }
  const chinatown = kobeById.get('nankinmachi-1025');
  if (!chinatown?.plan?.some(s => s.includes('Maps: «34.688328,135.189405»')) ||
      !chinatown?.plan?.some(s => s.includes('元町通1-3-7') && s.includes('仮店舗'))) {
    errors.push('25/10: Chinatown necesita puerta Chōan y Rōshōki provisional, no locales ambiguos');
  }
  const walk = kobeDay.mapStages?.find(s => s.id === 'kobe-a-pie');
  if (!walk?.activityIds?.includes('galerias-1025') || !walk?.activityIds?.includes('meriken-1025')) {
    errors.push('25/10: faltan pines de Kobe en el mapa por tramos');
  }
}

// El error de octubre venía de colocar un horario shrink-0 ancho junto al
// título flex-1. El título se comprimía a una sola palabra por línea.
const card = readFileSync('src/components/ActivityCard.astro', 'utf8');
if (!card.includes('flex min-w-0 flex-wrap items-center gap-1.5')) {
  errors.push('ActivityCard: los chips y el horario deben estar en una fila con flex-wrap.');
}
if (!card.includes('mt-2 min-w-0 break-words text-base')) {
  errors.push('ActivityCard: el título necesita su propia línea flexible.');
}
if (card.includes('flex shrink-0 items-center gap-2')) {
  errors.push('ActivityCard: regresión del contenedor shrink-0 que rompía los títulos móviles.');
}
if (!card.includes('>Observaciones</p>') || !card.includes('Historia y significado')) {
  errors.push('ActivityCard: faltan las secciones de observaciones o historia.');
}

if (errors.length) {
  console.error(`\nValidación fallida con ${errors.length} errores:\n- ${errors.join('\n- ')}\n`);
  process.exit(1);
}
console.log(`✓ Itinerario verificado: ${days} días, ${activities} actividades, ${temples} fichas de templos con historia. Cabeceras móviles protegidas.\n`);
