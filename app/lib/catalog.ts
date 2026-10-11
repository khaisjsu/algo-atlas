import { graphModules } from "./modules/graphs";
import { linearModules } from "./modules/linear";
import { searchingModules } from "./modules/searching";
import { sortingModules } from "./modules/sorting";
import { treeModules } from "./modules/trees";
import type { VizModule } from "./types";

/** Single source of truth for every interactive lesson exposed to the UI and API. */
export const moduleCatalog: VizModule[] = [
  ...sortingModules,
  ...searchingModules,
  ...linearModules,
  ...treeModules,
  ...graphModules,
];

export const findModule = (slug: string) => moduleCatalog.find((module) => module.slug === slug);

export const publicModule = (module: VizModule) => ({
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
