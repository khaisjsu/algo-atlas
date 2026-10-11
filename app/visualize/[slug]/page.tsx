import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Visualizer } from "../../components/Visualizer";
import { findModule, modules } from "../../lib/registry";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return modules.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const mod = findModule(slug);
  if (!mod) return { title: "Not found | Algo Atlas" };
  return {
    title: `${mod.title.en} — interactive visualisation | Algo Atlas`,
    description: `${mod.short.en} Step through it, read the pseudocode, and learn where it is used in real systems.`,
  };
}

export default async function VisualizePage({ params }: Props) {
  const { slug } = await params;
  if (!findModule(slug)) notFound();
  return <Visualizer slug={slug} />;
}
