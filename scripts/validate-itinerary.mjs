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
