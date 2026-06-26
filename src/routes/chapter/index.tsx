import { createRoute, Link, useParams } from '@tanstack/react-router';
import { chapters } from '../../lib/chapters';
import { Route as rootRoute } from '../__root';
import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Helmet } from 'react-helmet-async';

gsap.registerPlugin(ScrollTrigger);

// ── Lightbox ────────────────────────────────────────────────────────────────
interface LightboxProps {
  images: { src: string; caption: string }[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const item = images[index];

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} sur ${images.length} — ${item.caption}`}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Contenu — stoppe la propagation pour ne pas fermer au clic sur l'image */}
      <div
        className="relative max-w-5xl w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compteur */}
        <p className="text-xs text-zinc-500 mb-4 tracking-widest">
          {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
        </p>

        {/* Image */}
        <img
          src={item.src}
          alt={item.caption}
          className="max-h-[75vh] w-full object-contain rounded-2xl"
          decoding="async"
        />

        {/* Caption */}
        <p className="mt-5 text-sm text-zinc-400 font-light text-center max-w-lg">{item.caption}</p>

        {/* Navigation gauche / droite */}
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={onPrev}
            disabled={index === 0}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            aria-label="Photo précédente"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={onNext}
            disabled={index === images.length - 1}
            className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
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
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        aria-label="Fermer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Page chapitre ────────────────────────────────────────────────────────────
function ChapterPage() {
  const { id } = useParams({ from: '/chapter/$id' });
  const chapter = chapters.find((c) => c.id === id);

  const galleryRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() =>
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextPhoto = useCallback(() =>
    setLightboxIndex((i) => (i !== null && chapter && i < chapter.gallery.length - 1 ? i + 1 : i)), [chapter]);

  useEffect(() => {
    if (!chapter) return;

    const ctx = gsap.context(() => {
      // Hero image + texte — fade + légère montée
      gsap.fromTo(
        heroImgRef.current,
        { opacity: 0, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' }
      );
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.2 }
      );

      // Galerie — fade + mouvement vertical léger, sans blur
      const galleryItems = galleryRef.current?.children;
      if (galleryItems) {
        gsap.fromTo(
          galleryItems,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.14,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: galleryRef.current,
              start: 'top 78%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Barre de progression
      const currentIndex = chapters.findIndex((c) => c.id === id);
      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          height: `${((currentIndex + 1) / chapters.length) * 100}%`,
          duration: 0.6,
          ease: 'power2.out',
        });
      }
    }, containerRef);

    return () => { ctx.revert(); };
  }, [id, chapter]);

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center section-dark">
        <p className="text-2xl font-light">Chapitre non trouvé</p>
      </div>
    );
  }

  const currentIndex = chapters.findIndex((c) => c.id === id);
  const prevChapter = chapters[currentIndex - 1];
  const nextChapter = chapters[currentIndex + 1];
  const isDark = chapter.theme === 'dark';

  return (
    <div ref={containerRef}>
      <Helmet>
        <title>{chapter.title} — Mikaela</title>
        <meta name="description" content={chapter.longDescription} />
        <meta property="og:title" content={`${chapter.title} — Mikaela`} />
        <meta property="og:description" content={chapter.longDescription} />
        <meta property="og:image" content={chapter.cover} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* ── Header fixe ── */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 z-50 bg-black/85 backdrop-blur-md border-b border-white/5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Accueil
        </Link>
        <p className="text-sm text-white/50 font-light">
          {chapter.chapter} <span className="mx-1 opacity-30">·</span> {currentIndex + 1} / {chapters.length}
        </p>
      </header>

      {/* ── Hero immersif ── */}
      <div className="relative h-[70vh] min-h-[480px] flex items-end overflow-hidden bg-black">
        <img
          ref={heroImgRef}
          src={chapter.cover}
          alt={`${chapter.title} — photo principale`}
          className="absolute inset-0 w-full h-full object-cover opacity-0"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div ref={heroRef} className="relative max-w-4xl mx-auto w-full px-6 md:px-12 pb-14 opacity-0">
          <p className="text-xs uppercase tracking-[0.25em] text-white/50 mb-3 font-medium">
            {chapter.chapter}
          </p>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-4">
            {chapter.title}
          </h1>
          <p className="text-base md:text-lg text-white/70 max-w-xl font-light leading-relaxed">
            {chapter.description}
          </p>
        </div>
      </div>

      {/* ── Timeline de progression ── */}
      <nav
        className="sticky top-16 z-40 bg-black/90 backdrop-blur-sm border-b border-white/10"
        aria-label="Navigation chapitres"
      >
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex items-stretch overflow-x-auto scrollbar-none">
          {chapters.map((ch, i) => {
            const isActive = ch.id === id;
            const isPast = i < currentIndex;
            return (
              <Link
                key={ch.id}
                to="/chapter/$id"
                params={{ id: ch.id }}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 pt-4 pb-3 min-w-[80px] relative
                  transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white
                  ${isActive ? 'text-white' : isPast ? 'text-white/45 hover:text-white/70' : 'text-white/25 hover:text-white/50'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Numéro */}
                <span className={`text-[10px] font-semibold tracking-widest transition-colors duration-200
                  ${isActive ? 'text-white' : isPast ? 'text-white/40' : 'text-white/20'}`}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Dot avec trait horizontal */}
                <div className="flex items-center w-full">
                  {i > 0 && (
                    <div className={`flex-1 h-px transition-colors duration-300 ${isPast || isActive ? 'bg-white/40' : 'bg-white/10'}`} />
                  )}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 mx-1
                    ${isActive ? 'bg-white scale-125 shadow-[0_0_6px_rgba(255,255,255,0.6)]' : isPast ? 'bg-white/50' : 'bg-white/20'}`}
                  />
                  {i < chapters.length - 1 && (
                    <div className={`flex-1 h-px transition-colors duration-300 ${isPast ? 'bg-white/40' : 'bg-white/10'}`} />
                  )}
                </div>
                {/* Titre */}
                <span className="text-[11px] font-medium whitespace-nowrap">{ch.title}</span>
                {/* Soulignement actif */}
                <div className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-300
                  ${isActive ? 'bg-white' : 'bg-transparent'}`} />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Contenu ── */}
      <section className={`${isDark ? 'section-dark' : 'section-light'} transition-colors duration-700`}>
        {/* Long texte */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-16 pb-14">
          <p className="text-lg md:text-xl font-light leading-relaxed" style={{ opacity: 0.8 }}>
            {chapter.longDescription}
          </p>
        </div>

        {/* Galerie */}
        <div
          ref={galleryRef}
          className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-24"
        >
          {chapter.gallery.map((item, i) => (
            <button
              key={i}
              onClick={() => openLightbox(i)}
              className={`group text-left space-y-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded-chapter ${
                i === 0 ? 'md:col-span-2' : ''
              }`}
              aria-label={`Agrandir : ${item.caption}`}
            >
              <div className={`overflow-hidden rounded-chapter ${i === 0 ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}>
                <img
                  src={item.src}
                  alt={item.caption}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>
              <p className="text-sm font-light text-center" style={{ opacity: 0.65 }}>{item.caption}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ── Navigation prev / next ── */}
      <nav
        className={`${isDark ? 'section-dark' : 'section-light'} border-t border-current/10`}
        aria-label="Navigation entre chapitres"
      >
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link
              to="/chapter/$id"
              params={{ id: prevChapter.id }}
              className="inline-flex items-center gap-3 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded"
            >
              <span className="w-10 h-10 rounded-full border border-current/30 flex items-center justify-center group-hover:bg-current/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ opacity: 0.45 }}>Précédent</p>
                <p className="text-sm font-medium">{prevChapter.title}</p>
              </div>
            </Link>
          ) : <div />}

          {nextChapter ? (
            <Link
              to="/chapter/$id"
              params={{ id: nextChapter.id }}
              className="inline-flex items-center gap-3 text-right group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded"
            >
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ opacity: 0.45 }}>Suivant</p>
                <p className="text-sm font-medium">{nextChapter.title}</p>
              </div>
              <span className="w-10 h-10 rounded-full border border-current/30 flex items-center justify-center group-hover:bg-current/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-3 group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded"
            >
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ opacity: 0.45 }}>Fin</p>
                <p className="text-sm font-medium">Retour à l'accueil</p>
              </div>
              <span className="w-10 h-10 rounded-full border border-current/30 flex items-center justify-center group-hover:bg-current/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              </span>
            </Link>
          )}
        </div>
      </nav>

      <footer className={`h-20 w-full flex items-center justify-center ${isDark ? 'section-dark' : 'section-light'} border-t border-current/10`}>
        <p className="text-xs font-light tracking-wide" style={{ opacity: 0.4 }}>
          © 2026 · Mikaela · Tous droits réservés
        </p>
      </footer>

      {/* ── Barre de progression desktop ── */}
      <div
        className="fixed right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center z-50"
        aria-hidden="true"
      >
        {chapters.map((ch, i) => {
          const isActive = ch.id === id;
          const isPast = i < currentIndex;
          return (
            <div key={ch.id} className="relative flex flex-col items-center group/dot">
              {/* Trait au-dessus (sauf premier) */}
              {i > 0 && (
                <div className={`w-px h-7 transition-colors duration-500 ${isPast || isActive ? 'bg-white/60' : 'bg-zinc-700'}`} />
              )}

              {/* Point */}
              <Link
                to="/chapter/$id"
                params={{ id: ch.id }}
                onMouseEnter={() => setHoveredDot(i)}
                onMouseLeave={() => setHoveredDot(null)}
                className={`relative z-10 rounded-full border-2 transition-all duration-300
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white
                  ${isActive
                    ? 'w-3.5 h-3.5 bg-white border-white shadow-[0_0_10px_rgba(255,255,255,0.5)]'
                    : isPast
                    ? 'w-2.5 h-2.5 bg-white/50 border-white/50 hover:bg-white hover:border-white hover:scale-110'
                    : 'w-2.5 h-2.5 bg-transparent border-zinc-600 hover:border-white/60 hover:scale-110'
                  }`}
                aria-label={ch.title}
              />

              {/* Tooltip */}
              {hoveredDot === i && (
                <div className="pointer-events-none absolute right-full mr-5 top-1/2 -translate-y-1/2
                                flex items-center gap-2 whitespace-nowrap animate-fade-in">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-xs font-medium px-3 py-1.5 rounded-full border backdrop-blur-sm
                    ${isActive
                      ? 'bg-white text-black border-white/20'
                      : 'bg-black/80 text-white border-white/10'}`}>
                    {ch.title}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Fill animé */}
        <div className="absolute inset-0 flex justify-center pointer-events-none -z-10">
          <div className="w-px bg-zinc-800 h-full rounded-full" />
          <div
            ref={progressFillRef}
            className="absolute top-0 w-px bg-gradient-to-b from-white to-white/20 rounded-full"
            style={{ height: '0%' }}
          />
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxIndex !== null && (
        <Lightbox
          images={chapter.gallery}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chapter/$id',
  component: ChapterPage,
});
