<!-- Use this file to provide workspace-specific custom instructions to Copilot.
For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a web-based productivity platform for students, offering a collection of academic tools and resources under one website.

## Tech Stack
- **Frontend**: React.js (with Next.js) and TailwindCSS for modern responsive design
- **Backend**: Node.js with Express.js, or Firebase (for auth and real-time data)
- **Database**: MongoDB (via Mongoose), Firebase Firestore, or Supabase (optional depending on tools)
- **CMS**: Sanity.io or Markdown-based for managing blog content
- **PDF Export**: html2pdf.js, dom-to-image, or jspdf
- **PWA**: Next.js PWA plugin or Workbox for installable experience
- **Hosting**: Vercel, Netlify, or Firebase Hosting

## Project Structure
- `/src/app/` - Next.js App Router pages with layouts
- `/src/components/` - Reusable React components organized by feature
- `/public/` - Static assets (images, icons, manifest, favicon)
- `/utils/` - Shared utility functions (GPA formulas, PDF export logic, etc.)

## Key Features
- Unit Converter (Physics, CS, Math, Engineering units)
- GPA Calculator (10-point, 4-point, and percentage-based systems)
- Resume Builder with PDF export and templates
- Timetable Maker (weekly planner with download/share options)
- Study Timer (Pomodoro-based timer with alert)
- Flashcard Creator (editable, save & repeat flashcards)
- Notes Organizer (Markdown editor with themes and tags)
- Scientific Calculator (in-browser calculations)
- Blog Section with SEO-focused student productivity tips
- Dashboard to save and access personalized tools
- Auth system for saving user-generated data (Firebase or Supabase)

## Development Guidelines
- Use modern ES6+ JavaScript and React functional components
- Prefer hooks (useState, useEffect, useContext) over class components
- Maintain clean folder structure and modular components
- Follow REST API or use Firebase real-time functions
- Sanitize all user inputs (resume builder, calculator forms, etc.)
- Use environment variables for API keys, MongoDB URI, Firebase config
- Follow accessibility and responsive design principles
- Include `robots.txt`, `sitemap.xml`, and meta tags for SEO
- Use Framer Motion or Tailwind transitions for simple animations
- Organize blog posts with metadata (title, description, keywords)

## Component Organization
- `/src/components/layout/` - Header, Footer, Navigation components
- `/src/components/home/` - Homepage specific components (Hero, ToolsGrid, Features)
- `/src/components/ui/` - Reusable UI components (Button, Card, Input, etc.)
- `/src/components/tools/` - Individual tool components

## Styling Guidelines
- Use TailwindCSS utility classes for styling
- Custom color palette defined in tailwind.config.js
- Responsive design with mobile-first approach
- Consistent spacing and typography scale
- Dark mode support where applicable

## Code Quality
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture
- Clean, readable, and maintainable code
