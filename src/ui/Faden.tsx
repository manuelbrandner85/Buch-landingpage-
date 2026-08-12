'use client';

import { useFaden } from '@/camera/useFaden';

/** Das Signaturelement. Er läuft über die ganze Welt und reißt zwischen den Bänden nicht ab. */
export function Faden() {
  useFaden('faden-pfad', 'faden-perle', 'faden');
  return (
    <svg id="faden" className="faden" preserveAspectRatio="none" aria-hidden="true">
      <path id="faden-pfad" />
      <circle id="faden-perle" r={2.8} cx={-10} cy={-10} />
    </svg>
  );
}
