'use client';

import { useLocale, useTranslations } from 'next-intl';

/** Anchuras deterministas del código de barras (sin aleatoriedad → sin hidratación rota). */
const BARCODE = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2, 4, 2, 1, 3, 1, 2, 2, 1, 4, 1, 3];

const PRICES = ['2,15', '3,80', '1,95', '4,20', '5,90'];
const TOTAL = '18,00';

/**
 * Un ticket de compra térmico dibujado con CSS: la pieza central del hero.
 * Cuenta la historia del producto: un ticket ya leído y clasificado por Tikit.
 */
export function ReceiptCard() {
  const t = useTranslations('landing.receipt');
  const locale = useLocale();
  const dec = (v: string) => (locale === 'es' ? v : v.replace(',', '.'));

  const items = [t('item1'), t('item2'), t('item3'), t('item4'), t('item5')];

  return (
    <div className="w-full font-mono text-ink [box-shadow:14px_18px_0_0_rgba(20, 27, 24,0.16)]">
      {/* Borde superior rasgado */}
      <div className="tk-teeth tk-teeth-up [--tk-teeth-color:#f1f4ee]" />

      <div className="bg-[#f1f4ee] px-6 py-7 sm:px-8">
        {/* Cabecera del comercio */}
        <p className="tk-condensed text-center text-2xl">{t('store')}</p>
        <p className="mt-1 text-center text-[10px] tracking-[0.25em] text-ash">{t('city')}</p>

        <div className="my-4 border-t-2 border-dashed border-ink/30" />

        <div className="flex justify-between text-[10px] tracking-widest text-ash">
          <span>28/06/2026 — 19:42</span>
          <span>Nº 0847</span>
        </div>

        <div className="my-4 border-t-2 border-dashed border-ink/30" />

        {/* Artículos */}
        <ul className="space-y-2 text-xs sm:text-[13px]">
          {items.map((item, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3">
              <span className="truncate">{item}</span>
              <span className="shrink-0 tabular-nums">{dec(PRICES[i])}</span>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t-2 border-dashed border-ink/30" />

        {/* Total */}
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold tracking-widest">{t('total')}</span>
          <span className="text-2xl font-bold tabular-nums">{dec(TOTAL)} €</span>
        </div>
        <p className="mt-1 text-right text-[10px] tracking-widest text-ash">{t('vat')}</p>

        {/* Lo que añade Tikit: categoría detectada */}
        <div className="mt-5 border-[3px] border-thermal px-3 py-2.5">
          <p className="text-[9px] tracking-[0.3em] text-thermal">{t('categoryLabel')}</p>
          <p className="mt-1 flex items-center gap-2 text-sm font-bold text-thermal">
            <span aria-hidden="true">→</span>
            {t('category')}
          </p>
        </div>

        {/* Código de barras */}
        <div className="mt-5 flex h-12 items-stretch gap-[3px]" aria-hidden="true">
          {BARCODE.map((w, i) => (
            <span key={i} className="bg-ink" style={{ width: `${w * 2}px` }} />
          ))}
        </div>
        <p className="mt-2 text-[9px] tracking-[0.4em] text-ash">8 411414 100847</p>

        <p className="mt-5 text-center text-[10px] font-bold tracking-[0.2em]">{t('thanks')}</p>
        <p className="mt-1 text-center text-[9px] tracking-[0.15em] text-thermal">
          ★ {t('readBy')} ★
        </p>
      </div>

      {/* Borde inferior rasgado */}
      <div className="tk-teeth [--tk-teeth-color:#f1f4ee]" />
    </div>
  );
}
