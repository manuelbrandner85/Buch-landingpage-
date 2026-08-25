import type { Metadata } from 'next';
import { ORTE } from '@/data/gemeinsam/orte';
import { LEITREIHE } from '@/world/registry';
import { wegOrt } from '@/world/wege';
import { Weiterleitung, weiterleitungsKopf } from '@/ui/Weiterleitung';

export const dynamicParams = false;
export function generateStaticParams() { return ORTE.map((o) => ({ id: o.id })); }

const ziel = async (params: Promise<{ id: string }>) =>
  wegOrt(LEITREIHE.id, (await params).id);

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return weiterleitungsKopf(await ziel(params));
}

export default async function Alt({ params }: { params: Promise<{ id: string }> }) {
  return <Weiterleitung ziel={await ziel(params)} />;
}
