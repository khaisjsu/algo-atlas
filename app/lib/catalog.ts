import type { AnyModule } from "./registry";
import { findModule as findInRegistry, modules } from "./registry";

/** Every interactive lesson exposed to the API — the same list the website uses. */
export const moduleCatalog: AnyModule[] = modules;

export const findModule = findInRegistry;

export const publicModule = (module: AnyModule) => ({
  slug: module.slug,
  title: module.title,
  short: module.short,
  category: module.category,
  tags: module.tags,
  view: module.view,
  complexity: module.complexity,
  intro: module.intro,
  invariant: module.invariant,
  actions: module.actions.map((action) => ({
    id: action.id,
    label: action.label,
    fields: action.fields ?? [],
    code: action.code ?? [],
  })),
});
