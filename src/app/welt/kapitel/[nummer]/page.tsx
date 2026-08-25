import type { Metadata } from 'next';
import { LEITREIHE, oeffentlicheBaendeVon } from '@/world/registry';
import { wegKapitel } from '@/world/wege';
import { Weiterleitung, weiterleitungsKopf } from '@/ui/Weiterleitung';

export const dynamicParams = false;
export function generateStaticParams() {
  return oeffentlicheBaendeVon(LEITREIHE)
    .flatMap((b) => b.kapitel.map((k) => ({ nummer: String(k.id) })));
}

const ziel = async (params: Promise<{ nummer: string }>) =>
  wegKapitel(LEITREIHE.id, Number((await params).nummer));

export async function generateMetadata(
  { params }: { params: Promise<{ nummer: string }> }): Promise<Metadata> {
  return weiterleitungsKopf(await ziel(params));
}

export default async function Alt({ params }: { params: Promise<{ nummer: string }> }) {
  return <Weiterleitung ziel={await ziel(params)} />;
}
