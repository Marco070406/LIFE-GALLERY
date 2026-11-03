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

L'app tourne sur [http://localhost:3000](http://localhost:3000).

## Autres commandes

```bash
npm run build      # Build de production dans dist/
npm run start      # Prévisualiser le build (vite preview)
npm run lint       # Linter ESLint
npm run typecheck  # Vérification TypeScript
```

## Souvenirs de la famille (photos + messages)

En bas de chaque chapitre, les proches peuvent envoyer une photo avec un message.
Un **code famille** est demandé pour envoyer. Les photos sont redimensionnées dans le navigateur
(1600 px max) puis stockées avec les messages dans une base **Neon** (Postgres).

### Mise en route

1. Créer un projet sur [console.neon.tech](https://console.neon.tech) et copier la chaîne de connexion (`postgresql://...`).
2. En local : copier `.env.example` en `.env` et remplir `DATABASE_URL`, `FAMILY_CODE` et `ADMIN_CODE`.
3. Sur Vercel : *Settings → Environment Variables*, ajouter les mêmes variables puis redéployer.

La table `memories` est créée automatiquement au premier appel.

### Supprimer un souvenir

En bas de la section « Souvenirs de la famille », le lien discret **Administration** demande le code
`ADMIN_CODE`. Une fois validé (pour la durée de l'onglet), un bouton **Supprimer** apparaît sous chaque souvenir.

### API

- `GET /api/memories?chapter=<id>` — souvenirs d'un chapitre
- `POST /api/memories` — ajoute un souvenir (code famille requis)
- `DELETE /api/memories` — supprime un souvenir (code administrateur requis)
- `POST /api/admin` — vérifie le code administrateur
- `GET /api/photo?id=<id>` — l'image d'un souvenir

Les fonctions sont dans `api/` (format Vercel) et sont servies par Vite en développement.

## Modifier le contenu

- **Chapitres, textes, images** : éditer `src/lib/chapters.ts`
- **Page d'accueil** : `src/routes/index.tsx`
- **Page d'un chapitre** : `src/routes/chapter/index.tsx`
- **Layout global** : `src/routes/__root.tsx`
- **Images** : déposer les fichiers dans `public/images/`
