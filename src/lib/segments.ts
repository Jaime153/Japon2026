import type { CollectionEntry } from 'astro:content';

export type SegmentData = CollectionEntry<'segments'>['data'];

/**
 * Un tramo tiene contenido real cuando ya hay días planificados, o cuando
 * alguno de sus módulos candidatos tiene actividades. Un módulo candidato
 * vacío (sin actividades) NO cuenta como contenido real.
 */
export function hasContent(segment: SegmentData): boolean {
  if (segment.days.length > 0) return true;
  return segment.candidateModules.some((candidateModule) => candidateModule.activities.length > 0);
}

export function getModulesWithContent(segment: SegmentData) {
  return segment.candidateModules.filter((candidateModule) => candidateModule.activities.length > 0);
}

export function getTripDateRange(segments: SegmentData[]): { start: Date; end: Date } {
  const starts = segments.map((segment) => segment.startDate.getTime());
  const ends = segments.map((segment) => segment.endDate.getTime());
  return { start: new Date(Math.min(...starts)), end: new Date(Math.max(...ends)) };
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatDayHeading(date: Date): string {
  const formatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}
