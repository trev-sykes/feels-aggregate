# Feels Aggregate

Real-time anonymous mood tracker. Vote your current emotion and explore live global sentiment through interactive heatmaps.

## Features

- Anonymous voting - one vote per day without personal data collection
- Real-time emotion aggregation across all users
- 24-hour heatmap visualization of mood trends
- Dynamic social media preview images showing current dominant emotion
- Fully responsive design

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- PostgreSQL (Neon)
- Prisma ORM
- Tailwind CSS v4
- Vercel (deployment)

## Database Schema

The application uses two main models:

**EmotionVote** - Stores individual votes with anonymous identity hashing
- One vote per user per day constraint
- Tracks emotion, day, hour, and hashed identity

**EmotionAggregate** - Pre-computed hourly emotion counts
- Optimized for fast heatmap queries
- Unique constraint on day, hour, and emotion combination

**Emotion Types**: happy, content, neutral, stressed, sad, angry

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/feels-aggregate.git
cd feels-aggregate
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables

Create a `.env` file:
```env
DATABASE_URL="your_postgresql_connection_string"
IDENTITY_SECRET="your_random_secret_key"
```

4. Run database migrations
```bash
npx prisma migrate dev
npx prisma generate
```

5. Start development server
```bash
npm run dev
```

Visit http://localhost:3000

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables (DATABASE_URL, IDENTITY_SECRET)
4. Deploy

Prisma client generation runs automatically during build.

## Project Structure
```
app/
├── actions/          # Server actions for vote submission
├── api/og-image/     # Dynamic OG image generation
├── components/       # React components
├── lib/              # Database utilities and queries
├── generated/        # Prisma client output
└── page.tsx          # Main application page

prisma/
└── schema.prisma     # Database schema definition
```

## Key Implementation Details

### Anonymous Identity System

Users are identified by SHA-256 hash of:
- IP address
- User agent
- Server-side secret

This enables one-vote-per-day enforcement without storing personal information.

### Aggregation Strategy

Votes trigger updates to the EmotionAggregate table, maintaining real-time counts by hour and emotion. This denormalized approach optimizes read performance for the heatmap visualization.

### Dynamic OG Images

The `/api/og-image` route generates PNG images on-demand showing:
- Current dominant emotion
- Total vote count
- Distribution bar chart

Images are cached for 60 seconds and include the site logo.

## Privacy

- No cookies or tracking scripts
- No personal information stored
- Anonymous identity hashing only
- No third-party analytics

## Contributing

Issues and pull requests are welcome. Please ensure code follows existing patterns and includes appropriate type safety.

## Development

### Running Migrations

After schema changes:
```bash
npx prisma migrate dev --name migration_description
npx prisma generate
```

### Type Generation

Prisma client types are generated to `app/generated/prisma` for full TypeScript support throughout the application.