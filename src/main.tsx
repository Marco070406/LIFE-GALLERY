import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './lib/router';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
);
