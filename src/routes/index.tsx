import { createRoute, Link } from '@tanstack/react-router';
import { chapters } from '../lib/chapters';
import { Route as rootRoute } from './__root';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function HomePage() {
  const heroNameRef    = useRef<HTMLHeadingElement>(null);
  const heroSubRef     = useRef<HTMLParagraphElement>(null);
  const heroCtaRef     = useRef<HTMLDivElement>(null);
  const sectionsRef    = useRef<HTMLElement[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const mm = gsap.matchMedia(containerRef);

    // ── Animations complètes ─────────────────────────────────────────────
    mm.add(`not ${REDUCED_MOTION}`, () => {
      // Hero entrance
      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo(heroNameRef.current,
          { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
        .fromTo(heroSubRef.current,
          { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
        .fromTo(heroCtaRef.current,
          { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');

      sectionsRef.current.forEach((section) => {
        const elements = section.querySelectorAll('.animate-item');

        gsap.fromTo(elements,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 1,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // Parallax subtil (max 15px), piloté par ScrollTrigger
        gsap.fromTo(section.querySelectorAll('.parallax-image'),
          { y: 0 },
          {
            y: 15,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
          }
        );
      });
    });

    // ── Mouvement réduit : tout est visible immédiatement ────────────────
    mm.add(REDUCED_MOTION, () => {
      gsap.set([heroNameRef.current, heroSubRef.current, heroCtaRef.current], { opacity: 1 });
    });

    // ── Toujours actif : progression + chapitre courant ──────────────────
    mm.add('all', () => {
      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          height: '100%',
          ease: 'none',
          scrollTrigger: { start: 'top top', end: 'max', scrub: true },
        });
      }

      sectionsRef.current.forEach((section, i) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive) setActiveIndex(i);
            else if (i === 0 && self.direction < 0) setActiveIndex(null);
          },
        });
      });
    });

    return () => mm.revert();
  }, []);

  const scrollToSection = (i: number) => {
    const target = sectionsRef.current[i];
    if (!target) return;
    const reduced = window.matchMedia(REDUCED_MOTION).matches;
    gsap.to(window, {
      scrollTo: { y: target, offsetY: 0 },
      duration: reduced ? 0 : 1.2,
      ease: 'power3.inOut',
    });
  };

  return (
    <div ref={containerRef}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="min-h-svh w-full flex flex-col items-center justify-center bg-night text-paper relative overflow-hidden">
        {/* Photo de fond */}
        <div className="absolute inset-0">
          <img
            src={chapters[0].cover}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="w-full h-full object-cover opacity-30 scale-105 sepia-[0.35] blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/40 to-night" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--night)_85%)]" />
        </div>

        <div className="relative text-center px-6 max-w-3xl">
          <p className="eyebrow text-gold mb-8">
            Une vie en images
          </p>
          <h1
            ref={heroNameRef}
            className="font-display italic font-light text-7xl md:text-[9rem] leading-none mb-8 opacity-0"
          >
            Mikaela
          </h1>
          <p
            ref={heroSubRef}
            className="text-lg md:text-xl text-paper/75 mb-12 opacity-0 font-light leading-relaxed max-w-md mx-auto"
          >
            Cinq chapitres. Une seule histoire.<br />Racontée en lumière.
          </p>
          <div ref={heroCtaRef} className="opacity-0">
            <button
              type="button"
              onClick={() => scrollToSection(0)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-paper text-night rounded-full text-sm tracking-wide font-medium hover:bg-gold active:scale-95 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper cursor-pointer"
            >
              Découvrir l'histoire
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll hint animé (décoratif, animé en CSS) */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-3" aria-hidden="true">
          <div className="flex items-center gap-[3px]">
            {'DÉFILER'.split('').map((letter, i) => (
              <span
                key={i}
                className="scroll-letter text-[10px] text-zinc-600 inline-block"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <svg className="w-4 h-4 text-zinc-600 scroll-arrow scroll-arrow-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            <svg className="w-4 h-4 text-zinc-500 scroll-arrow scroll-arrow-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            <svg className="w-4 h-4 text-zinc-400 scroll-arrow scroll-arrow-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Barre de progression desktop ──────────────────────────────── */}
      <nav
        className="fixed right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-0 z-50"
        aria-label="Progression dans l'histoire"
      >
        {chapters.map((ch, i) => {
          const isActive = activeIndex === i;
          return (
            <div key={ch.id} className="relative flex flex-col items-center group/dot">
              {i > 0 && (
                <div className="w-px h-8 bg-zinc-700 group-hover/dot:bg-zinc-500 transition-colors duration-300" />
              )}
              <button
                type="button"
                onClick={() => scrollToSection(i)}
                aria-label={`Aller au chapitre ${i + 1} : ${ch.title}`}
                aria-current={isActive ? 'step' : undefined}
                className={`relative rounded-full border-2 transition-all duration-300 z-10 cursor-pointer
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white
                  ${isActive
                    ? 'w-3.5 h-3.5 bg-gold border-gold shadow-[0_0_0_3px_rgba(0,0,0,0.35)]'
                    : 'w-2.5 h-2.5 bg-black/20 border-zinc-400 hover:border-white hover:bg-white/30'}`}
              />
              {/* Label au survol / focus */}
              <div className="pointer-events-none absolute right-full mr-5 top-1/2 -translate-y-1/2
                              opacity-0 group-hover/dot:opacity-100 group-focus-within/dot:opacity-100
                              translate-x-2 group-hover/dot:translate-x-0 group-focus-within/dot:translate-x-0
                              transition-all duration-200 flex items-center gap-2 whitespace-nowrap" aria-hidden="true">
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-white font-medium bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                  {ch.title}
                </span>
              </div>
            </div>
          );
        })}
        {/* Trait fond + fill */}
        <div className="absolute inset-0 flex justify-center pointer-events-none -z-10" aria-hidden="true">
          <div className="w-px bg-zinc-800 h-full rounded-full" />
          <div
            ref={progressFillRef}
            className="absolute top-0 w-px bg-gradient-to-b from-white/80 to-white/20 rounded-full"
            style={{ height: '0%' }}
          />
        </div>
      </nav>

      {/* ── Sections chapitres ────────────────────────────────────────── */}
      <main>
        {chapters.map((chapter, index) => (
          <section
            key={chapter.id}
            id={chapter.id}
            ref={(el) => { if (el) sectionsRef.current[index] = el; }}
            aria-labelledby={`${chapter.id}-title`}
            className={`relative overflow-hidden min-h-svh w-full flex flex-col items-center justify-center py-24 md:py-32
              ${chapter.theme === 'light' ? 'section-light' : 'section-dark'}`}
          >
            <div className="relative w-full max-w-6xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              {/* Numéro en filigrane */}
              <span
                aria-hidden="true"
                className={`chapter-numeral absolute -top-10 md:-top-16 text-[9rem] md:text-[16rem] pointer-events-none
                  ${index % 2 === 0 ? 'right-4 md:right-10' : 'left-4 md:left-10'}`}
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Tirage photo */}
              <div className={`relative animate-item ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <div className={`photo-print mx-auto max-w-[340px] md:max-w-none transition-transform duration-700 ease-out
                  ${index % 2 === 0 ? '-rotate-[1.5deg] hover:rotate-0' : 'rotate-[1.5deg] hover:rotate-0'}`}>
                  <img
                    src={chapter.cover}
                    alt={`${chapter.title} — couverture`}
                    loading="lazy"
                    decoding="async"
                    width={440}
                    height={550}
                    className="w-full aspect-[4/5] object-cover rounded-[2px] parallax-image"
                  />
                </div>
              </div>

              {/* Texte */}
              <div className="relative text-center md:text-left">
                <p className="eyebrow md:eyebrow-left mb-6 opacity-70 animate-item">
                  {chapter.chapter}
                </p>
                <h2 id={`${chapter.id}-title`} className="font-display text-5xl md:text-7xl font-light leading-[1.05] mb-6 animate-item">
                  {chapter.title}
                </h2>
                <p className="font-display italic text-lg md:text-2xl font-light mb-10 max-w-md mx-auto md:mx-0 leading-snug opacity-80 animate-item">
                  {chapter.description}
                </p>
                <Link
                  to="/chapter/$id"
                  params={{ id: chapter.id }}
                  className="btn-chapter group inline-flex items-center gap-2 px-8 py-3.5 border border-current/40
                    rounded-full text-sm font-medium tracking-wide animate-item
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                >
                  Ouvrir le chapitre
                  <span className="sr-only"> {chapter.title}</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        ))}
      </main>

      {/* ── Navigation mobile ─────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-night/90 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)]"
        aria-label="Chapitres"
      >
        <div className="flex overflow-x-auto scrollbar-none py-3 px-4 gap-2 justify-center-safe">
          {chapters.map((ch, i) => (
            <Link
              key={ch.id}
              to="/chapter/$id"
              params={{ id: ch.id }}
              aria-current={activeIndex === i ? 'step' : undefined}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl
                hover:text-white hover:bg-white/10 transition-all duration-200
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-white
                ${activeIndex === i ? 'text-gold bg-white/10' : 'text-white/60'}`}
            >
              <span className="text-xs font-medium">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-xs whitespace-nowrap">{ch.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="w-full py-16 flex flex-col items-center justify-center gap-3 section-dark border-t border-white/5 mb-20 md:mb-0">
        <p className="font-display italic text-3xl font-light text-gold">Mikaela</p>
        <p className="text-xs opacity-50 font-light tracking-wide">© {new Date().getFullYear()} · Tous droits réservés</p>
      </footer>

    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});
