import { useRef, useState } from 'preact/hooks';

const near = (n: number, i: number, len: number) => n === i || n === (i + 1) % len || n === (i - 1 + len) % len;

// Галерея карточки товара: большое фото, стрелки, свайп и лента миниатюр.
type Photo = { small: string; large: string };
type Props = { photos: Photo[]; alt: string };

export default function Gallery({ photos, alt }: Props) {
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0, 1, photos.length - 1]));
  const touch = useRef<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const go = (n: number) => {
    const next = (n + photos.length) % photos.length;
    setI(next);
    setSeen((s) => new Set([...s, next, (next + 1) % photos.length, (next - 1 + photos.length) % photos.length]));
    strip.current?.children[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div class="gallery">
      <div
        class="gallery__main"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
      >
        {photos.map((p, n) => (seen.has(n) || near(n, i, photos.length)) && (
          <img
            key={p.large}
            class={n === i ? 'is-active' : ''}
            aria-hidden={n !== i}
            src={p.small}
            srcset={`${p.small} 800w, ${p.large} 1600w`}
            sizes="(min-width: 1024px) 62vw, 100vw"
            alt={n === 0 ? alt : `${alt}, фото ${n + 1}`}
            loading={n === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
        <button type="button" class="gallery__arrow gallery__arrow--prev" onClick={() => go(i - 1)} aria-label="Предыдущее фото">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" class="gallery__arrow gallery__arrow--next" onClick={() => go(i + 1)} aria-label="Следующее фото">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5l7 7-7 7" /></svg>
        </button>
        <span class="gallery__count caps">
          {String(i + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
        </span>
      </div>
      <div class="gallery__strip" ref={strip}>
        {photos.map((p, n) => (
          <button type="button" class={`gallery__thumb${n === i ? ' is-active' : ''}`} onClick={() => go(n)} aria-label={`Фото ${n + 1}`} key={p.small}>
            <img src={p.small} alt="" loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
    </div>
  );
}
