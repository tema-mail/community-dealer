import { useEffect, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';

// Первый экран: 2 слайда, автолистание с полосками прогресса (по мотивам bork.ru).
// Содержимое слайдов приходит из Astro именованными слотами s1 и s2.
type Props = { s1: ComponentChildren; s2: ComponentChildren; labels: string[]; interval?: number };

export default function HeroSlider({ s1, s2, labels, interval = 7000 }: Props) {
  const slides = [s1, s2];
  const [active, setActive] = useState(0);
  const [cycle, setCycle] = useState(0); // перезапуск анимации полоски
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false); // фокус или курсор внутри – не листаем
  const touch = useRef<number | null>(null);

  const go = (i: number) => {
    setActive((i + slides.length) % slides.length);
    setCycle((c) => c + 1);
  };

  useEffect(() => {
    if (paused || held || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go(active + 1), interval);
    return () => window.clearTimeout(t);
  }, [active, cycle, paused, held]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (window.scrollY > window.innerHeight / 2) return; // слайдер не на экране
      if (e.key === 'ArrowRight') go(active + 1);
      if (e.key === 'ArrowLeft') go(active - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <section
      class="hero"
      aria-roledescription="carousel"
      aria-label="Community Dealer"
      // держим слайд только при фокусе с клавиатуры: клик мышью по кнопкам автолистание не останавливает
      onFocusIn={(e) => (e.target as HTMLElement).matches?.(':focus-visible') && setHeld(true)}
      onFocusOut={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHeld(false)}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current === null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) go(active + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
    >
      {slides.map((s, i) => (
        <div
          class={`hero__slide hero__slide--${i + 1}${i === active ? ' is-active' : ''}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`${i + 1} из ${slides.length}`}
          inert={i !== active}
          key={i}
        >
          {s}
        </div>
      ))}

      <div class="hero__ui">
        <div class="hero__bars">
          {slides.map((_, i) => (
            <button
              type="button"
              class={`hero__bar${i === active ? ' is-active' : ''}${i < active ? ' is-done' : ''}`}
              onClick={() => go(i)}
              aria-label={`Слайд ${i + 1}: ${labels[i]}`}
              key={`${i}-${i === active ? cycle : 'x'}`}
              style={{ '--dur': `${interval}ms`, '--play': paused || held ? 'paused' : 'running' }}
            >
              <span class="hero__bar-num">{String(i + 1).padStart(2, '0')}</span>
              <span class="hero__bar-label">{labels[i]}</span>
              <span class="hero__bar-track"><i /></span>
            </button>
          ))}
        </div>
        <div class="hero__arrows">
          <button type="button" class="icon-btn hero__nav" onClick={() => go(active - 1)} aria-label="Предыдущий слайд">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" class="icon-btn" onClick={() => {
              if (paused) setCycle((c) => c + 1); // после паузы полоска и таймер стартуют заново
              setPaused((p) => !p);
            }} aria-label={paused ? 'Продолжить' : 'Пауза'}>
            {paused ? (
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h3v14H7zM14 5h3v14h-3z" /></svg>
            )}
          </button>
          <button type="button" class="icon-btn hero__nav" onClick={() => go(active + 1)} aria-label="Следующий слайд">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
