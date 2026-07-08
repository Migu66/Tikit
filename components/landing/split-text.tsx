'use client';

/**
 * Trocea texto en piezas animables (.tk-char / .tk-word) manteniendo el
 * texto íntegro para lectores de pantalla. Las piezas no se animan solas:
 * cada sección las anima con GSAP a través de sus selectores.
 */

interface SplitProps {
  text: string;
  className?: string;
}

export function SplitChars({ text, className = '' }: SplitProps) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((ch, i) => (
          <span key={i} className={`tk-char ${className}`}>
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
    </>
  );
}

/** Cada palabra va enmascarada en su propio clip para reveals por palabra. */
export function SplitWords({ text, className = '' }: SplitProps) {
  const words = text.split(' ');
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, i) => (
          <span key={i} className="tk-clip !inline-block align-bottom">
            <span className={`tk-word ${className}`}>
              {word}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          </span>
        ))}
      </span>
    </>
  );
}
