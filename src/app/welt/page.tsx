import type { Metadata } from 'next';
import { LEITREIHE } from '@/world/registry';
import { wegReihe } from '@/world/wege';
import { Weiterleitung, weiterleitungsKopf } from '@/ui/Weiterleitung';

export const metadata: Metadata = weiterleitungsKopf(wegReihe(LEITREIHE.id));
export default function Alt() { return <Weiterleitung ziel={wegReihe(LEITREIHE.id)} />; }
