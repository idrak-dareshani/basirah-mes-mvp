# Basirah-MES (Manufacturing Execution System)

A modern web application built with [Vite](https://vitejs.dev/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/).

## Project Structure

```
.
├── src/                # Source code
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Entry point
│   ├── index.css       # Global styles
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   └── types/          # TypeScript types
├── .bolt/              # Bolt configuration and migrations
│   ├── config.json
│   ├── prompt
│   └── supabase_discarded_migrations/
├── supabase/           # Supabase migrations
│   └── migrations/
├── index.html          # HTML template
├── package.json        # Project metadata and scripts
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
├── tsconfig*.json      # TypeScript configuration
└── README.md           # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

```sh
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

### Build

Build for production:

```sh
npm run build
```

### Lint

Run ESLint:

```sh
npm run lint
```

## Supabase

Database migrations are managed in the [`supabase/migrations/`](supabase/migrations/) directory. Discarded migrations are stored in [`.bolt/supabase_discarded_migrations/`](.bolt/supabase_discarded_migrations/).

## Configuration

- Vite: [`vite.config.ts`](vite.config.ts)
- Tailwind: [`tailwind.config.js`](tailwind.config.js)
- TypeScript: [`tsconfig.json`](tsconfig.json), [`tsconfig.app.json`](tsconfig.app.json), [`tsconfig.node.json`](tsconfig.node.json)

## License

[MIT](LICENSE) (update as appropriate)
