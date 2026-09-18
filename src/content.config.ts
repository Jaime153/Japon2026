import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const CATEGORIES = [
  'comida',
  'templo',
  'mirador',
  'transporte',
  'compras',
  'ocio',
  'otro',
] as const;

const categorySchema = z.enum(CATEGORIES);

const activityLinksSchema = z.object({
  googleMaps: z.string().url().optional(),
  appleMaps: z.string().url().optional(),
  tabelog: z.string().url().optional(),
  officialWebsite: z.string().url().optional(),
  reservation: z.string().url().optional(),
});

const activitySchema = z.object({
  id: z.string(),
  title: z.string(),
  time: z.string().optional(),
  links: activityLinksSchema.optional(),
  notes: z.string().optional(),
  // Este repo es público (GitHub Pages): nunca guardes aquí códigos de reserva, localizadores, PNR ni datos personales — solo información pública/práctica.
  address: z.string().optional(),
  nearestStation: z.string().optional(),
  duration: z.string().optional(),
  approximatePrice: z.string().optional(),
  reservationRequired: z.boolean().optional(),
  category: categorySchema,
});

function findDuplicateIds(activities: { id: string }[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const activity of activities) {
    if (seen.has(activity.id)) {
      duplicates.add(activity.id);
    }
    seen.add(activity.id);
  }
  return [...duplicates];
}

const daySchema = z.object({
  date: z.coerce.date(),
  title: z.string().optional(),
  activities: z.array(activitySchema),
});

const candidateModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  activities: z.array(activitySchema),
});

const hotelSchema = z.object({
  name: z.string(),
  mapsUrl: z.string().url().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
});

const segmentSchema = z
  .object({
    order: z.number(),
    city: z.string(),
    legLabel: z.string().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    hotel: hotelSchema,
    days: z.array(daySchema),
    candidateModules: z.array(candidateModuleSchema),
  })
  .superRefine((segment, ctx) => {
    if (segment.startDate > segment.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `startDate (${segment.startDate.toISOString()}) debe ser anterior o igual a endDate (${segment.endDate.toISOString()})`,
        path: ['startDate'],
      });
    }

    segment.days.forEach((day, dayIndex) => {
      if (day.date < segment.startDate || day.date > segment.endDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `El día ${day.date.toISOString()} está fuera del rango del segmento (${segment.startDate.toISOString()} - ${segment.endDate.toISOString()})`,
          path: ['days', dayIndex, 'date'],
        });
      }

      const duplicates = findDuplicateIds(day.activities);
      if (duplicates.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `IDs de actividad duplicados en el día ${day.date.toISOString()}: ${duplicates.join(', ')}`,
          path: ['days', dayIndex, 'activities'],
        });
      }
    });

    segment.candidateModules.forEach((candidateModule, moduleIndex) => {
      const duplicates = findDuplicateIds(candidateModule.activities);
      if (duplicates.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `IDs de actividad duplicados en el módulo "${candidateModule.title}": ${duplicates.join(', ')}`,
          path: ['candidateModules', moduleIndex, 'activities'],
        });
      }
    });
  });

const segments = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/segments' }),
  schema: segmentSchema,
});

export const collections = { segments };
