import { createRouter } from '@tanstack/react-router';
import { Route as rootRoute } from '../routes/__root';
import { Route as indexRoute } from '../routes/index';
import { Route as chapterRoute } from '../routes/chapter';

const routeTree = rootRoute.addChildren([indexRoute, chapterRoute]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultStaleTime: 1000 * 60 * 5,
  // Retour arrière : on retrouve la position de scroll de la page précédente
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
