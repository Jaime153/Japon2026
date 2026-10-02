import type { CollectionEntry } from 'astro:content';

export type Category = CollectionEntry<'segments'>['data']['days'][number]['activities'][number]['category'];

interface CategoryMeta { label: string; icon: string; className: string; }

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  comida: { label: 'Comida', icon: '🍜', className: 'bg-amber-100 text-amber-900' },
  templo: { label: 'Templo', icon: '⛩️', className: 'bg-rose-100 text-rose-900' },
  mirador: { label: 'Mirador', icon: '🗻', className: 'bg-sky-100 text-sky-900' },
  transporte: { label: 'Transporte', icon: '🚆', className: 'bg-slate-200 text-slate-800' },
  compras: { label: 'Compras', icon: '🛍️', className: 'bg-pink-100 text-pink-900' },
  ocio: { label: 'Ocio', icon: '🎡', className: 'bg-violet-100 text-violet-900' },
  naturaleza: { label: 'Naturaleza', icon: '🌿', className: 'bg-emerald-100 text-emerald-900' },
  barrio: { label: 'Zona', icon: '🏮', className: 'bg-orange-100 text-orange-900' },
  otro: { label: 'Parada', icon: '📍', className: 'bg-zinc-100 text-zinc-800' },
};

export const STATUS_META = {
  confirmado: { label: 'Confirmado', className: 'bg-emerald-100 text-emerald-900' },
  plan: { label: 'Plan', className: 'bg-blue-100 text-blue-900' },
  opcional: { label: 'Opcional', className: 'bg-zinc-100 text-zinc-700' },
  pendiente: { label: 'Pendiente', className: 'bg-amber-100 text-amber-900' },
} as const;
