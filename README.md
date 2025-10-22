# SabPaisa Admin Portal v5

World-class mobile-first admin portal built with Next.js 14, React 18, and TypeScript 5.

## Features

- **Next.js 14** - Latest App Router with Server Components
- **React 18** - Concurrent features and improved performance
- **TypeScript 5** - Full type safety with strict mode
- **Tailwind CSS** - Mobile-first utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **TanStack Query** - Powerful data fetching and caching
- **Zustand** - Lightweight state management
- **Recharts** - Beautiful data visualizations

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Update the environment variables in `.env` file.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
sabpaisa_admin_v5/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── advanced/         # Advanced feature components
├── lib/                  # Utility libraries
│   └── utils.ts         # Common utilities
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
├── services/            # API service layer
├── constants/           # Application constants
└── public/              # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:analyze` - Build with bundle analyzer
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Check TypeScript types
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage

## Development Guidelines

### Mobile-First Approach

This project follows a mobile-first design philosophy:

- All components are designed for mobile screens first
- Responsive breakpoints: xs (375px), sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-optimized interactions with minimum 44px touch targets
- Safe area insets for notched devices

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused

### Performance

- Use Server Components by default
- Implement code splitting for large features
- Optimize images with Next.js Image component
- Use React Query for efficient data fetching
- Implement proper loading and error states

### Accessibility

- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain color contrast ratios
- Test with screen readers

## Tech Stack Details

### Core

- **Next.js 14.1.0** - React framework with App Router
- **React 18.2.0** - UI library
- **TypeScript 5.3.3** - Type safety

### UI & Styling

- **Tailwind CSS 3.4.1** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Framer Motion 11.0.3** - Animation library
- **Lucide React** - Icon library

### State & Data

- **TanStack Query 5.17.9** - Data fetching and caching
- **Zustand 4.4.7** - State management

### Utilities

- **dayjs** - Date manipulation
- **crypto-js** - Encryption
- **papaparse** - CSV parsing
- **recharts** - Charts and graphs
- **react-hot-toast** - Toast notifications

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - SabPaisa

## Support

For support, contact the development team.
