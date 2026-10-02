import type { CollectionEntry } from 'astro:content';

export type SegmentData = CollectionEntry<'segments'>['data'];
export type SegmentEntry = CollectionEntry<'segments'>;

export function hasContent(segment: SegmentData): boolean {
  if (segment.days.length > 0) return true;
  return segment.candidateModules.some((candidateModule) => candidateModule.activities.length > 0);
}

export function getModulesWithContent(segment: SegmentData) {
  return segment.candidateModules.filter((candidateModule) => !candidateModule.forDate && candidateModule.activities.length > 0);
}

export function getDayAlternatives(segment: SegmentData, date: Date) {
  const target = isoDate(date);
  return segment.candidateModules.filter(
    (candidateModule) => candidateModule.forDate && isoDate(candidateModule.forDate) === target && candidateModule.activities.length > 0,
  );
}

export function getTripDateRange(segments: SegmentData[]): { start: Date; end: Date } {
  const starts = segments.map((segment) => segment.startDate.getTime());
  const ends = segments.map((segment) => segment.endDate.getTime());
  return { start: new Date(Math.min(...starts)), end: new Date(Math.max(...ends)) };
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

export function formatDayHeading(date: Date): string {
  const formatted = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function formatDateRange(start: Date, end: Date): string {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function flattenDays(segments: SegmentEntry[]) {
  return segments.flatMap((segment) =>
    segment.data.days.map((day) => ({
      segmentId: segment.id,
      segmentTitle: segment.data.legLabel ?? segment.data.city,
      city: segment.data.city,
      day,
    })),
  ).sort((a, b) => a.day.date.getTime() - b.day.date.getTime());
}
