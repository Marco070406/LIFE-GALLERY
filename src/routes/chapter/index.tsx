import { createRoute, lazyRouteComponent, notFound } from '@tanstack/react-router';
import { chapters } from '../../lib/chapters';
import { Route as rootRoute } from '../__root';

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chapter/$id',
  loader: ({ params }) => {
    const chapter = chapters.find((c) => c.id === params.id);
    if (!chapter) throw notFound();
    return chapter;
  },
  // Page chargée à la demande : l'accueil ne télécharge pas le code des chapitres.
  component: lazyRouteComponent(() => import('./ChapterPage')),
});
