import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';

export const Route = createRootRoute({
  component: () => (
    <>
      <Helmet>
        <title>Mikaela — Une Vie en Images</title>
        <meta name="description" content="Cinq chapitres. Une seule histoire. Racontée en lumière." />
        <meta property="og:title" content="Mikaela — Une Vie en Images" />
        <meta property="og:description" content="Cinq chapitres. Une seule histoire. Racontée en lumière." />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#000000" />
      </Helmet>
      <Outlet />
    </>
  ),
});
