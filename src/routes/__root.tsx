import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';

function NotFound() {
  return (
    <main className="min-h-svh flex flex-col items-center justify-center gap-6 px-6 text-center section-dark">
      <Helmet>
        <title>Page introuvable — Mikaela</title>
      </Helmet>
      <p className="text-xs uppercase tracking-[0.3em] opacity-60 font-medium">Erreur 404</p>
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Ce chapitre n'existe pas</h1>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        Retour à l'accueil
      </Link>
    </main>
  );
}

export const Route = createRootRoute({
  component: () => (
    <>
      <Helmet>
        <html lang="fr" />
        <title>Mikaela — Une Vie en Images</title>
        <meta name="description" content="Cinq chapitres. Une seule histoire. Racontée en lumière." />
        <meta property="og:title" content="Mikaela — Une Vie en Images" />
        <meta property="og:description" content="Cinq chapitres. Une seule histoire. Racontée en lumière." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="fr_FR" />
      </Helmet>
      <Outlet />
    </>
  ),
  notFoundComponent: NotFound,
});
