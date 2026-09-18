import type { CollectionEntry } from 'astro:content';

export type Category = CollectionEntry<'segments'>['data']['days'][number]['activities'][number]['category'];

interface CategoryMeta {
  label: string;
  icon: string;
  className: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  comida: { label: 'Comida', icon: '🍜', className: 'bg-amber-100 text-amber-800' },
  templo: { label: 'Templo', icon: '⛩️', className: 'bg-rose-100 text-rose-800' },
  mirador: { label: 'Mirador', icon: '🗻', className: 'bg-sky-100 text-sky-800' },
  transporte: { label: 'Transporte', icon: '🚗', className: 'bg-slate-200 text-slate-700' },
  compras: { label: 'Compras', icon: '🛍️', className: 'bg-pink-100 text-pink-800' },
  ocio: { label: 'Ocio', icon: '🎡', className: 'bg-violet-100 text-violet-800' },
  otro: { label: 'Otro', icon: '📍', className: 'bg-emerald-100 text-emerald-800' },
};
