import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Helmet } from 'react-helmet-async';

export const Route = createRootRoute({
  component: () => (
    <>
      <Helmet>
        <title>Une Vie en Images</title>
        <meta name="description" content="Cinq chapitres. Une histoire. Racontée en lumière." />
      </Helmet>
      <Outlet />
    </>
  ),
});