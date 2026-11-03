import { Link, useLoaderData } from '@tanstack/react-router';
import { chapters, type Chapter } from '../../lib/chapters';
import { Lightbox } from '../../components/Lightbox';
import { FamilyMemories } from '../../components/FamilyMemories';
import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Helmet } from 'react-helmet-async';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// ── Page chapitre ────────────────────────────────────────────────────────────
function ChapterPage({ chapter }: { chapter: Chapter }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const galleryLength = chapter.gallery.length;
  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = chapters[currentIndex - 1];
  const nextChapter = chapters[currentIndex + 1];
  const isDark = chapter.theme === 'dark';
  const themeClass = isDark ? 'section-dark' : 'section-light';

  const openLightbox = useCallback((i: number) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPhoto = useCallback(() =>
    setLightboxIndex((i) => (i !== null && i > 0 ? i - 1 : i)), []);
  const nextPhoto = useCallback(() =>
    setLightboxIndex((i) => (i !== null && i < galleryLength - 1 ? i + 1 : i)), [galleryLength]);

  useEffect(() => {
    const mm = gsap.matchMedia(containerRef);

    mm.add(`not ${REDUCED_MOTION}`, () => {
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

      // Galerie — fade + mouvement vertical léger
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
              start: 'top 85%',
              once: true,
            },
          }
        );
      }

      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          height: `${((currentIndex + 1) / chapters.length) * 100}%`,
          duration: 0.6,
          ease: 'power2.out',
        });
      }
    });

    mm.add(REDUCED_MOTION, () => {
      gsap.set([heroImgRef.current, heroRef.current], { opacity: 1 });
      gsap.set(progressFillRef.current, { height: `${((currentIndex + 1) / chapters.length) * 100}%` });
    });

    return () => mm.revert();
  }, [currentIndex]);

  return (
    <div ref={containerRef}>
      <Helmet>
        <title>{`${chapter.title} — Mikaela`}</title>
        <meta name="description" content={chapter.longDescription} />
        <meta property="og:title" content={`${chapter.title} — Mikaela`} />
        <meta property="og:description" content={chapter.longDescription} />
        <meta property="og:image" content={new URL(chapter.cover, window.location.origin).href} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* ── Header fixe ── */}
      <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-6 md:px-12 z-50 bg-night/85 backdrop-blur-md border-b border-white/5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Accueil
        </Link>
        <p className="text-sm text-white/60 font-light">
          <span className="font-display italic text-gold mr-2">Mikaela</span>
          <span className="hidden sm:inline">{chapter.chapter}</span> <span className="mx-1 opacity-50 hidden sm:inline" aria-hidden="true">·</span> {currentIndex + 1} / {chapters.length}
        </p>
      </header>

      {/* ── Hero immersif ── */}
      <div className="relative h-[70svh] min-h-[480px] flex items-end overflow-hidden bg-night">
        <img
          ref={heroImgRef}
          src={chapter.cover}
          alt={`${chapter.title} — photo principale`}
          className="absolute inset-0 w-full h-full object-cover sepia-[0.15] opacity-0"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
        <div ref={heroRef} className="relative max-w-4xl mx-auto w-full px-6 md:px-12 pb-14 opacity-0">
          <p className="eyebrow eyebrow-left text-gold mb-5">
            {chapter.chapter}
          </p>
          <h1 className="font-display text-6xl md:text-8xl font-light leading-none text-paper mb-5">
            {chapter.title}
          </h1>
          <p className="font-display italic text-lg md:text-2xl text-paper/80 max-w-xl font-light leading-snug">
            {chapter.description}
          </p>
        </div>
      </div>

      {/* ── Timeline de progression ── */}
      <nav
        className="sticky top-16 z-40 bg-night/90 backdrop-blur-md border-b border-white/10"
        aria-label="Navigation chapitres"
      >
        <div className="max-w-4xl mx-auto px-6 md:px-12 flex items-stretch justify-center-safe overflow-x-auto scrollbar-none">
          {chapters.map((ch, i) => {
            const isActive = i === currentIndex;
            const isPast = i < currentIndex;
            return (
              <Link
                key={ch.id}
                to="/chapter/$id"
                params={{ id: ch.id }}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 pt-4 pb-3 min-w-[80px] relative
                  transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white
                  ${isActive ? 'text-white' : isPast ? 'text-white/55 hover:text-white/80' : 'text-white/40 hover:text-white/70'}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Numéro */}
                <span className="text-[10px] font-semibold tracking-widest">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {/* Dot avec trait horizontal */}
                <div className="flex items-center w-full" aria-hidden="true">
                  <div className={`flex-1 h-px transition-colors duration-300 ${i === 0 ? 'bg-transparent' : isPast || isActive ? 'bg-white/40' : 'bg-white/10'}`} />
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 mx-1
                    ${isActive ? 'bg-gold scale-125 shadow-[0_0_8px_rgba(200,164,106,0.7)]' : isPast ? 'bg-white/50' : 'bg-white/20'}`}
                  />
                  <div className={`flex-1 h-px transition-colors duration-300 ${i === chapters.length - 1 ? 'bg-transparent' : isPast ? 'bg-white/40' : 'bg-white/10'}`} />
                </div>
                {/* Titre */}
                <span className="text-[11px] font-medium whitespace-nowrap">{ch.title}</span>
                {/* Soulignement actif */}
                <div className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-300
                  ${isActive ? 'bg-gold' : 'bg-transparent'}`} />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Contenu ── */}
      <main className={themeClass}>
        {/* Long texte */}
        <div className="max-w-3xl mx-auto px-6 md:px-12 pt-20 pb-16 md:pt-28 md:pb-20">
          <p className="font-display text-xl md:text-3xl font-light leading-relaxed md:leading-relaxed
            first-letter:float-left first-letter:text-7xl md:first-letter:text-8xl first-letter:leading-[0.8]
            first-letter:mr-3 first-letter:mt-1 first-letter:text-gold first-letter:font-normal">
            {chapter.longDescription}
          </p>
          <div className="mt-12 flex items-center gap-4 opacity-50" aria-hidden="true">
            <span className="h-px flex-1 bg-current/40" />
            <span className="text-xs tracking-[0.3em] uppercase">{chapter.gallery.length} photos</span>
            <span className="h-px flex-1 bg-current/40" />
          </div>
        </div>

        {/* Galerie */}
        <div
          ref={galleryRef}
          className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-x-12 md:gap-y-16 pb-28"
        >
          {chapter.gallery.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => openLightbox(i)}
              className={`group text-left space-y-4 cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded-chapter ${
                i === 0 ? 'md:col-span-2' : ''
              }`}
              aria-label={`Agrandir la photo : ${item.caption}`}
            >
              <div className={`photo-print transition-transform duration-500 ease-out group-hover:-translate-y-1 ${i > 0 && i % 2 === 0 ? 'md:mt-12' : ''}`}>
                <div className={`overflow-hidden rounded-[2px] ${i === 0 ? 'aspect-[16/9]' : 'aspect-[4/5]'}`}>
                <img
                  src={item.src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
              </div>
              <p className="flex items-baseline gap-3 text-sm font-light">
                <span className="font-display italic text-gold text-base" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="opacity-75">{item.caption}</span>
              </p>
            </button>
          ))}
        </div>

        {/* Souvenirs envoyés par la famille */}
        <FamilyMemories chapterId={chapter.id} chapterTitle={chapter.title} />
      </main>

      {/* ── Navigation prev / next ── */}
      <nav
        className={`${themeClass} border-t border-current/10`}
        aria-label="Navigation entre chapitres"
      >
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-12 flex items-center justify-between gap-4">
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
                <p className="text-xs uppercase tracking-wider opacity-60">Précédent</p>
                <p className="font-display text-xl md:text-2xl font-light">{prevChapter.title}</p>
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
                <p className="text-xs uppercase tracking-wider opacity-60">Suivant</p>
                <p className="font-display text-xl md:text-2xl font-light">{nextChapter.title}</p>
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
              className="inline-flex items-center gap-3 text-right group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current rounded"
            >
              <div>
                <p className="text-xs uppercase tracking-wider opacity-60">Fin</p>
                <p className="font-display text-xl md:text-2xl font-light">Retour à l'accueil</p>
              </div>
              <span className="w-10 h-10 rounded-full border border-current/30 flex items-center justify-center group-hover:bg-current/10 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10.5L12 3l9 7.5M5 9v11h14V9" />
                </svg>
              </span>
            </Link>
          )}
        </div>
      </nav>

      <footer className={`w-full py-12 flex flex-col items-center justify-center gap-2 ${themeClass} border-t border-current/10`}>
        <p className="font-display italic text-2xl font-light text-gold">Mikaela</p>
        <p className="text-xs font-light tracking-wide opacity-50">
          © {new Date().getFullYear()} · Tous droits réservés
        </p>
      </footer>

      {/* ── Barre de progression desktop (décorative, la timeline ci-dessus porte la navigation) ── */}
      <div
        className="fixed right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center z-50"
        aria-hidden="true"
      >
        {chapters.map((ch, i) => {
          const isActive = i === currentIndex;
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
                tabIndex={-1}
                className={`relative z-10 rounded-full border-2 transition-all duration-300
                  ${isActive
                    ? 'w-3.5 h-3.5 bg-gold border-gold shadow-[0_0_0_3px_rgba(0,0,0,0.35)]'
                    : isPast
                    ? 'w-2.5 h-2.5 bg-white/50 border-white/50 hover:bg-white hover:border-white hover:scale-110'
                    : 'w-2.5 h-2.5 bg-black/20 border-zinc-400 hover:border-white/60 hover:scale-110'
                  }`}
              />

              {/* Tooltip */}
              <div className="pointer-events-none absolute right-full mr-5 top-1/2 -translate-y-1/2
                              flex items-center gap-2 whitespace-nowrap
                              opacity-0 translate-x-1 group-hover/dot:opacity-100 group-hover/dot:translate-x-0
                              transition-all duration-150">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={`text-xs font-medium px-3 py-1.5 rounded-full border backdrop-blur-sm
                  ${isActive
                    ? 'bg-gold text-night border-gold/20'
                    : 'bg-black/80 text-white border-white/10'}`}>
                  {ch.title}
                </span>
              </div>
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

export default function ChapterRoute() {
  const chapter = useLoaderData({ from: '/chapter/$id' });
  // La clé remonte la page à chaque changement de chapitre : état et animations repartent à zéro.
  return <ChapterPage key={chapter.id} chapter={chapter} />;
}
