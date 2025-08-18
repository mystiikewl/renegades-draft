# Renegades Draft

An NBA Fantasy Draft application built with React, TypeScript, and Supabase. This app allows friends to conduct real fantasy basketball drafts with live updates and real player statistics.

## Features

- Real-time Drafting: Live updates across all connected clients when picks are made
- Player Database: Real NBA player statistics from Supabase
- Advanced Filtering: Multi-position filtering, stat range filters, and sorting options
- Team Management: Team creation, assignment, and roster management
- Keeper System: Players can be kept for the next season
- Draft Trading: Teams can trade draft picks
- League Analysis: Comprehensive team and player performance metrics
- Responsive Design: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: shadcn-ui with Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **Backend**: Supabase (database, authentication, real-time subscriptions)
- **Routing**: React Router DOM
- **Data Visualization**: Recharts
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites

1. Node.js (version 16 or higher)
2. A Supabase account
3. A Netlify account (for deployment)

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/mystiikewl/renegades-draft.git
   cd renegades-draft/renegades-draft-central
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `renegades-draft-central` directory with your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Deployment to Netlify

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set the following environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Base directory: `renegades-draft-central`

## Project Structure

```
.
├── documentation/           # Project documentation
├── renegades-draft-central/ # Main application code
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── integrations/    # External service integrations (Supabase)
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper functions
│   ├── supabase/            # Supabase migrations
│   └── ...
└── ...
```

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/` to set up your database schema
3. Configure authentication settings
4. Set up Row Level Security (RLS) policies
5. Deploy the Supabase functions in `supabase/functions/`

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run import-players` - Import player data from CSV

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.