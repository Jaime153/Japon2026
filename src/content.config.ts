import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const CATEGORIES = ['comida','templo','mirador','transporte','compras','ocio','naturaleza','barrio','otro'] as const;
export const STATUSES = ['confirmado','plan','opcional','pendiente'] as const;

const categorySchema = z.enum(CATEGORIES);
const statusSchema = z.enum(STATUSES);

const activityLinksSchema = z.object({
  googleMaps: z.string().url().optional(),
  originMaps: z.string().url().optional(),
  destinationMaps: z.string().url().optional(),
  appleMaps: z.string().url().optional(),
  tabelog: z.string().url().optional(),
  officialWebsite: z.string().url().optional(),
  photoSpots: z.string().url().optional(),
  reservation: z.string().url().optional(),
  weather: z.string().url().optional(),
  weatherAlt: z.string().url().optional(),
  liveCam: z.string().url().optional(),
});

const flightPointSchema = z.object({
  airport: z.string(),
  code: z.string(),
  terminal: z.string(),
  date: z.string(),
  time: z.string(),
});

const flightLegSchema = z.object({
  airline: z.string(),
  flightNumber: z.string(),
  operatedBy: z.string().optional(),
  departure: flightPointSchema,
  arrival: flightPointSchema,
  duration: z.string().optional(),
});

const flightConnectionSchema = z.object({
  airport: z.string(),
  terminal: z.string(),
  duration: z.string(),
  sameTerminal: z.boolean().default(false),
  note: z.string().optional(),
});

const flightJourneySchema = z.object({
  travellers: z.array(z.string()).optional(),
  checkInNote: z.string().optional(),
  verificationNote: z.string().optional(),
  legs: z.array(flightLegSchema).min(1),
  connections: z.array(flightConnectionSchema).optional(),
});

const transitSchema = z.object({
  from: z.string().optional(),
  summary: z.string(),
  steps: z.array(z.string()).optional(),
  approximateDuration: z.string().optional(),
  note: z.string().optional(),
});

const parkingSchema = z.object({
  name: z.string(),
  mapcode: z.string(),
  kind: z.enum(['parking', 'reference']),
  mapsQuery: z.string(),
  spotQuery: z.string().optional(),
  notes: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  arrived: z.boolean().optional(),
});

const activitySchema = z.object({
  id: z.string(),
  title: z.string(),
  // Solo horarios breves en las cabeceras; explicaciones largas en 'notes'.
  time: z.string().max(16, 'La hora de una tarjeta debe ser breve (máximo 16 caracteres); mover explicaciones a observaciones').optional(),
  links: activityLinksSchema.optional(),
  notes: z.string().optional(),
  description: z.string().optional(),
  plan: z.array(z.string()).optional(),
  transit: transitSchema.optional(),
  flightJourney: flightJourneySchema.optional(),
  parking: parkingSchema.optional(),
  address: z.string().optional(),
  nearestStation: z.string().optional(),
  duration: z.string().optional(),
  approximatePrice: z.string().optional(),
  reservationRequired: z.boolean().optional(),
  goshuin: z.boolean().optional(),
  skipped: z.boolean().optional(),
  category: categorySchema,
  status: statusSchema.default('plan'),
  priority: z.enum(['must','nice']).optional(),
  locationQuery: z.string().optional(),
});

function findDuplicateIds(activities: { id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const activity of activities) {
    if (seen.has(activity.id)) duplicates.add(activity.id);
    seen.add(activity.id);
  }
  return [...duplicates];
}

const routeStopSchema = z.object({
  title: z.string(),
  locationQuery: z.string(),
  note: z.string().optional(),
  mapcode: z.string().optional(),
  mapcodeKind: z.enum(['parking', 'reference']).optional(),
  spotQuery: z.string().optional(),
});

const mapStageSchema = z.object({
  id: z.string(),
  title: z.string(),
  mode: z.enum(['walk', 'transit', 'drive', 'mixed']),
  activityIds: z.array(z.string()).min(2),
  expandable: z.boolean().optional(),
});

const daySchema = z.object({
  date: z.coerce.date(),
  mapStages: z.array(mapStageSchema).optional(),
  title: z.string().optional(),
  note: z.string().optional(),
  switchLabel: z.string().optional(),
  routeStops: z.array(routeStopSchema).optional(),
  status: statusSchema.default('plan'),
  activities: z.array(activitySchema),
});

const candidateModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  forDate: z.coerce.date().optional(),
  switchLabel: z.string().optional(),
  activities: z.array(activitySchema),
});

const hotelSchema = z.object({
  name: z.string(),
  mapsUrl: z.string().url().optional(),
  directionsUrl: z.string().url().optional(),
  address: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
});

const segmentSchema = z.object({
  order: z.number(),
  city: z.string(),
  legLabel: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  hotel: hotelSchema.optional(),
  days: z.array(daySchema),
  candidateModules: z.array(candidateModuleSchema).default([]),
}).superRefine((segment, ctx) => {
  if (segment.startDate > segment.endDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'startDate debe ser anterior o igual a endDate', path: ['startDate'] });
  }
  segment.days.forEach((day, dayIndex) => {
    if (day.date < segment.startDate || day.date > segment.endDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Día fuera del rango del segmento', path: ['days', dayIndex, 'date'] });
    }
    const duplicates = findDuplicateIds(day.activities);
    if (duplicates.length) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'IDs duplicados: ' + duplicates.join(', '), path: ['days', dayIndex, 'activities'] });
  });
});

const segments = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/segments' }),
  schema: segmentSchema,
});

export const collections = { segments };
