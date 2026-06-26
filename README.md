# Une Vie en Images — Life Gallery

Galerie photo narrative construite avec **Vite**, **React**, **TanStack Router** et **GSAP**.

## Stack

- [Vite](https://vitejs.dev/) — bundler et serveur de développement
- [React 19](https://react.dev/) — UI
- [TanStack Router](https://tanstack.com/router) — routing SPA type-safe
- [GSAP](https://gsap.com/) + ScrollTrigger — animations
- [Tailwind CSS v4](https://tailwindcss.com/) — styles
- [react-helmet-async](https://github.com/staylor/react-helmet-async) — gestion des balises `<head>`

## Structure du projet

```
src/
├── main.tsx                    # Point d'entrée React
├── styles.css                  # Styles globaux Tailwind
├── lib/
│   ├── chapters.ts             # Données des chapitres (titres, images, descriptions)
│   └── router.ts               # Configuration du router
└── routes/
    ├── __root.tsx              # Layout racine
    ├── index.tsx               # Page d'accueil (/)
    └── chapter/
        └── index.tsx           # Page chapitre (/chapter/$id)

public/
└── images/                     # Photos et illustrations par chapitre
```

## Démarrage

```bash
npm install
npm run dev
```

L'app tourne sur [http://localhost:5173](http://localhost:5173).

## Autres commandes

```bash
npm run build    # Build de production dans dist/
npm run start    # Prévisualiser le build (vite preview)
npm run lint     # Linter ESLint
```

## Modifier le contenu

- **Chapitres, textes, images** : éditer `src/lib/chapters.ts`
- **Page d'accueil** : `src/routes/index.tsx`
- **Page d'un chapitre** : `src/routes/chapter/index.tsx`
- **Layout global** : `src/routes/__root.tsx`
- **Images** : déposer les fichiers dans `public/images/`
