'use client';

import { useEffect, useState, useCallback } from 'react';
import { GA4, messungLaeuft, ZUSTIMMUNG_SCHLUESSEL } from '@/data/gemeinsam/messung';
import { wegImpressum } from '@/world/wege';

/**
 * Die Einwilligung in die Reichweitenmessung.
 *
 * Drei Regeln, die nicht verhandelbar sind, weil sie das Gesetz sind:
 *
 * 1. **Vor der Einwilligung passiert nichts.** Kein Skript wird geladen, kein
 *    Cookie gesetzt, keine Verbindung zu Google aufgebaut. Ein Banner, das die
 *    Messung schon mitlaufen lässt und nur noch nachträglich fragt, ist keine
 *    Einwilligung, sondern eine Benachrichtigung.
 * 2. **Ablehnen ist so einfach wie Zustimmen.** Beide Knöpfe stehen
 *    nebeneinander, gleich groß, gleich sichtbar. Ein grau hinterlegtes
 *    „Ablehnen" neben einem leuchtenden „Alles akzeptieren" ist der Trick,
 *    für den Aufsichtsbehörden inzwischen Bußgelder verhängen.
 * 3. **Widerruf jederzeit.** Im Impressum steht ein Knopf, der die
 *    Entscheidung zurücknimmt und die gesetzten Cookies löscht.
 *
 * Ohne `NEXT_PUBLIC_GA4` erscheint dieses Bauteil gar nicht – dann gibt es
 * nichts zu fragen, und die Seite bleibt so cookiefrei, wie sie war.
 *
 * Die Entscheidung liegt im lokalen Speicher, nicht in einem Cookie: Wer
 * ablehnt, soll sich nicht dafür einen Cookie einfangen.
 */

type Entscheidung = 'ja' | 'nein' | null;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function lesen(): Entscheidung {
  try {
    const w = window.localStorage.getItem(ZUSTIMMUNG_SCHLUESSEL);
    return w === 'ja' || w === 'nein' ? w : null;
  } catch {
    // Privates Fenster, gesperrter Speicher: Dann wird eben jedes Mal gefragt.
    // Stillschweigend messen wäre die falsche Auflösung dieser Unsicherheit.
    return null;
  }
}

/** Lädt gtag.js – ausschließlich von hier aus, ausschließlich nach 'ja'. */
function messungStarten(): void {
  if (!GA4 || document.getElementById('ga4')) return;
  const s = document.createElement('script');
  s.id = 'ga4';
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer ?? [];
  const gtag = (...a: unknown[]) => { window.dataLayer?.push(a); };
  gtag('js', new Date());
  // Kürzeste Speicherdauer, die GA4 zulässt, und keine Werbefunktionen: Was
  // hier gemessen wird, soll die Frage „wie viele waren da" beantworten und
  // sonst nichts.
  gtag('config', GA4, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
}

/** Räumt weg, was Google gesetzt hat. Nach einem Widerruf gehört das dazu. */
function messungLoeschen(): void {
  for (const roh of document.cookie.split(';')) {
    const name = roh.split('=')[0]?.trim();
    if (!name || !(name.startsWith('_ga') || name.startsWith('_gid'))) continue;
    for (const pfad of ['/', window.location.pathname]) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${pfad}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${pfad}; domain=.${window.location.hostname}`;
    }
  }
}

export function Zustimmung() {
  const [entscheidung, setEntscheidung] = useState<Entscheidung>(null);
  const [gefragt, setGefragt] = useState(false);

  useEffect(() => {
    if (!messungLaeuft()) return;
    const w = lesen();
    setEntscheidung(w);
    setGefragt(true);
    if (w === 'ja') messungStarten();
    // Das Impressum kann die Frage erneut stellen; das Ereignis kommt von dort.
    const nochmal = () => setEntscheidung(null);
    window.addEventListener('trendonix-messung-fragen', nochmal);
    return () => window.removeEventListener('trendonix-messung-fragen', nochmal);
  }, []);

  const merken = useCallback((w: 'ja' | 'nein') => {
    try { window.localStorage.setItem(ZUSTIMMUNG_SCHLUESSEL, w); } catch { /* dann eben nicht */ }
    setEntscheidung(w);
    if (w === 'ja') messungStarten();
    else messungLoeschen();
  }, []);

  if (!messungLaeuft() || !gefragt || entscheidung !== null) return null;

  return (
    <aside className="zustimmung" role="dialog" aria-modal="false"
      aria-labelledby="zustimmung-titel">
      <div className="zustimmung-text">
        <b id="zustimmung-titel">Dürfen wir zählen?</b>
        <p>
          Wir würden gern wissen, wie viele Menschen diese Seite lesen und über
          welchen Weg sie herkommen. Dafür setzt Google Analytics einen Cookie.
          Ohne Ihre Zustimmung passiert nichts davon – die Seite funktioniert
          vollständig, und Sie werden nicht noch einmal gefragt.{' '}
          <a href={`${wegImpressum()}#datenschutz`}>Was genau gemessen wird</a>
        </p>
      </div>
      <div className="zustimmung-knoepfe">
        <button type="button" onClick={() => merken('nein')}>Nein, danke</button>
        <button type="button" onClick={() => merken('ja')}>Einverstanden</button>
      </div>
    </aside>
  );
}

/**
 * Der Widerruf, für das Impressum.
 *
 * Steht dort, wo auch erklärt wird, was gemessen wird – und zeigt an, wie
 * gerade entschieden ist. Ein Widerrufsknopf, der nicht verrät, was er gerade
 * widerruft, hilft niemandem.
 */
export function ZustimmungAendern() {
  const [entscheidung, setEntscheidung] = useState<Entscheidung>(null);
  const [bereit, setBereit] = useState(false);

  useEffect(() => {
    if (!messungLaeuft()) return;
    setEntscheidung(lesen());
    setBereit(true);
  }, []);

  if (!messungLaeuft() || !bereit) return null;

  const zuruecknehmen = () => {
    try { window.localStorage.removeItem(ZUSTIMMUNG_SCHLUESSEL); } catch { /* dann eben nicht */ }
    messungLoeschen();
    setEntscheidung(null);
    window.dispatchEvent(new Event('trendonix-messung-fragen'));
  };

  return (
    <p className="widerruf">
      {entscheidung === 'ja'
        ? 'Sie haben der Reichweitenmessung zugestimmt.'
        : entscheidung === 'nein'
          ? 'Sie haben die Reichweitenmessung abgelehnt. Es wird nichts gemessen.'
          : 'Sie wurden noch nicht gefragt.'}
      {entscheidung !== null && (
        <>
          {' '}
          <button type="button" onClick={zuruecknehmen}>Entscheidung ändern</button>
        </>
      )}
    </p>
  );
}
