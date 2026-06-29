import { createRoute, Link } from '@tanstack/react-router';
import { chapters } from '../lib/chapters';
import { Route as rootRoute } from './__root';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useEffect, useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

function HomePage() {
  const heroNameRef    = useRef<HTMLHeadingElement>(null);
  const heroSubRef     = useRef<HTMLParagraphElement>(null);
  const heroCtaRef     = useRef<HTMLDivElement>(null);
  const sectionsRef    = useRef<HTMLElement[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const scrollHintRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Hero entrance ──────────────────────────────────────────────────
      const tl = gsap.timeline({ delay: 0.3 });
      tl.fromTo(heroNameRef.current,
          { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
        .fromTo(heroSubRef.current,
          { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.7')
        .fromTo(heroCtaRef.current,
          { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');

      // ── Animation vague "DÉFILER" ──────────────────────────────────────
      if (scrollHintRef.current) {
        const letters = scrollHintRef.current.querySelectorAll('.scroll-letter');
        gsap.to(letters, {
          y: -5,
          color: '#e4e4e7',
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          stagger: { each: 0.08, repeat: -1, yoyo: true },
        });
      }

      // ── Sections scroll ────────────────────────────────────────────────
      sectionsRef.current.forEach((section) => {
        const elements = section.querySelectorAll('.animate-item');

        gsap.fromTo(section,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
          }
        );

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
      });

      // ── Barre de progression scroll ────────────────────────────────────
      if (progressFillRef.current) {
        gsap.to(progressFillRef.current, {
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });
      }
    }, containerRef);

    // ── Parallax subtil (max 15px) ─────────────────────────────────────
    const handleParallax = () => {
      sectionsRef.current.forEach((section) => {
        const images = section.querySelectorAll('.parallax-image');
        images.forEach((img) => {
          const rect = section.getBoundingClientRect();
          const progress = Math.min(Math.max(1 - rect.top / window.innerHeight, 0), 1);
          gsap.set(img, { y: progress * 15 });
        });
      });
    };

    window.addEventListener('scroll', handleParallax, { passive: true });
    return () => {
      ctx.revert();
      window.removeEventListener('scroll', handleParallax);
    };
  }, []);

  const handleStartClick = () => {
    if (sectionsRef.current[0]) {
      gsap.to(window, {
        scrollTo: { y: sectionsRef.current[0], offsetY: 0 },
        duration: 1.2,
        ease: 'power3.inOut',
      });
    }
  };

  return (
    <div ref={containerRef}>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="h-screen w-full flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
        {/* Photo de fond */}
        <div className="absolute inset-0">
          <img
            src="/images/Mika baby 1.jpeg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-25 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        </div>

        <div className="relative text-center px-6 max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-6 font-medium">
            Une vie en images
          </p>
          <h1
            ref={heroNameRef}
            className="text-6xl md:text-8xl font-semibold tracking-tight mb-6 opacity-0"
          >
            Mikaela
          </h1>
          <p
            ref={heroSubRef}
            className="text-lg md:text-xl text-zinc-300 mb-12 opacity-0 font-light leading-relaxed max-w-md mx-auto"
          >
            Cinq chapitres. Une seule histoire.<br />Racontée en lumière.
          </p>
          <div ref={heroCtaRef} className="opacity-0">
            <button
              onClick={handleStartClick}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-base font-medium hover:bg-zinc-100 active:scale-95 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white cursor-pointer"
            >
              Découvrir l'histoire
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll hint animé */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div ref={scrollHintRef} className="flex items-center gap-[3px]" aria-label="Défiler">
            {'DÉFILER'.split('').map((letter, i) => (
              <span key={i} className="scroll-letter text-[10px] text-zinc-600 inline-block" aria-hidden="true">
                {letter}
              </span>
            ))}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <svg className="w-4 h-4 text-zinc-600 scroll-arrow scroll-arrow-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            <svg className="w-4 h-4 text-zinc-500 scroll-arrow scroll-arrow-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
            <svg className="w-4 h-4 text-zinc-400 scroll-arrow scroll-arrow-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── Barre de progression desktop ──────────────────────────────── */}
      <div
        className="fixed right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-0 z-50"
        aria-hidden="true"
      >
        {chapters.map((ch, i) => (
          <div key={ch.id} className="relative flex flex-col items-center group/dot">
            {i > 0 && (
              <div className="w-px h-8 bg-zinc-700 group-hover/dot:bg-zinc-500 transition-colors duration-300" />
            )}
            <Link
              to="/chapter/$id"
              params={{ id: ch.id }}
              title={ch.title}
              className="relative w-2.5 h-2.5 rounded-full border-2 border-zinc-600 bg-transparent
                hover:border-white hover:bg-white/30 transition-all duration-300 z-10
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            />
            {/* Label au survol */}
            <div className="pointer-events-none absolute right-full mr-5 top-1/2 -translate-y-1/2
                            opacity-0 group-hover/dot:opacity-100 translate-x-2 group-hover/dot:translate-x-0
                            transition-all duration-200 flex items-center gap-2 whitespace-nowrap">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="text-xs text-white font-medium bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                {ch.title}
              </span>
            </div>
          </div>
        ))}
        {/* Trait fond + fill */}
        <div className="absolute inset-0 flex justify-center pointer-events-none -z-10">
          <div className="w-px bg-zinc-800 h-full rounded-full" />
          <div
            ref={progressFillRef}
            className="absolute top-0 w-px bg-gradient-to-b from-white/80 to-white/20 rounded-full"
            style={{ height: '0%' }}
          />
        </div>
      </div>

      {/* ── Sections chapitres ────────────────────────────────────────── */}
      {chapters.map((chapter, index) => (
        <section
          key={chapter.id}
          ref={(el) => { if (el) sectionsRef.current[index] = el; }}
          className={`min-h-screen w-full flex flex-col items-center justify-center pt-20 pb-20 md:pt-0 md:pb-0
            ${chapter.theme === 'light' ? 'section-light' : 'section-dark'} transition-colors duration-700`}
        >
          <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
            <p className="text-xs uppercase tracking-[0.25em] mb-4 opacity-50 font-medium animate-item">
              {chapter.chapter}
            </p>
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-5 animate-item">
              {chapter.title}
            </h2>
            <p className="text-base md:text-lg mb-14 max-w-2xl mx-auto leading-relaxed animate-item"
               style={{ opacity: 0.75 }}>
              {chapter.description}
            </p>
            <div className="relative mb-14 animate-item">
              <img
                src={chapter.cover}
                alt={`${chapter.title} — couverture`}
                loading="lazy"
                decoding="async"
                className="w-72 h-72 md:w-[440px] md:h-[440px] object-cover rounded-chapter shadow-2xl mx-auto parallax-image"
              />
            </div>
            <Link
              to="/chapter/$id"
              params={{ id: chapter.id }}
              className="btn-chapter group inline-flex items-center gap-2 px-10 py-3.5 border border-current
                rounded-full text-sm font-medium animate-item mb-8 md:mb-0
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
            >
              Voir toutes les photos
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      ))}

      {/* ── Navigation mobile ─────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-t border-white/10"
        aria-label="Chapitres"
      >
        <div className="flex overflow-x-auto scrollbar-none py-3 px-4 gap-3 justify-center">
          {chapters.map((ch, i) => (
            <Link
              key={ch.id}
              to="/chapter/$id"
              params={{ id: ch.id }}
              className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl
                text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <span className="text-xs font-medium">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-xs">{ch.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="h-20 w-full flex items-center justify-center section-dark mb-20 md:mb-0">
        <p className="text-xs opacity-50 font-light tracking-wide">© 2026 • Mikaela • Tous droits réservés</p>
      </footer>

    </div>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});
