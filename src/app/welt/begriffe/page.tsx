import type { Metadata } from 'next';
import { LEITREIHE } from '@/world/registry';
import { wegBegriffe } from '@/world/wege';
import { Weiterleitung, weiterleitungsKopf } from '@/ui/Weiterleitung';

export const metadata: Metadata = weiterleitungsKopf(wegBegriffe(LEITREIHE.id));
export default function Alt() { return <Weiterleitung ziel={wegBegriffe(LEITREIHE.id)} />; }
