import { useEffect, useRef } from 'react';

const SWIPE_THRESHOLD = 50;

// ── Lightbox ────────────────────────────────────────────────────────────────
export interface LightboxImage {
  src: string;
  caption: string;
}

interface LightboxProps {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const item = images[index];
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  // Focus initial + restauration du focus + verrouillage du scroll
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      previouslyFocused?.focus();
    };
  }, []);

  // Navigation clavier + piège à focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled])');
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  // Précharge les photos voisines
  useEffect(() => {
    [images[index - 1], images[index + 1]].forEach((img) => {
      if (img) new Image().src = img.src;
    });
  }, [images, index]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (delta > SWIPE_THRESHOLD) onPrev();
    else if (delta < -SWIPE_THRESHOLD) onNext();
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} sur ${images.length} — ${item.caption}`}
      className="fixed inset-0 z-[100] bg-night/95 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Contenu — stoppe la propagation pour ne pas fermer au clic sur l'image */}
      <div
        className="relative max-w-5xl w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compteur */}
        <p className="text-xs text-zinc-400 mb-4 tracking-widest" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </p>

        {/* Image */}
        <img
          key={item.src + index}
          src={item.src}
          alt={item.caption}
          className="max-h-[70vh] w-full object-contain rounded-[3px] animate-fade-in-simple"
          decoding="async"
        />

        {/* Caption */}
        <p className="mt-6 font-display italic text-lg md:text-xl text-paper/85 font-light text-center max-w-lg">{item.caption}</p>

        {/* Navigation gauche / droite */}
        <div className="flex items-center gap-6 mt-6">
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Photo précédente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index === images.length - 1}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Photo suivante"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Fermer */}
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Fermer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
