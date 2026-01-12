# Hero Time - AI-Powered Character Image Generator

A Next.js application that allows users to create custom hero images by combining uploaded photos with various props and accessories, powered by AI image generation.

## 🚀 Features

- **AI Image Generation**: Transform photos into hero-themed images using Replicate AI
- **Interactive Character Builder**: Drag-and-drop interface for adding props to different body positions
- **Dynamic Props System**: Props automatically loaded from Supabase Storage
- **Template System**: Pre-configured templates for quick character creation
- **Subscription Tiers**: Free, Pro, and Premium plans with different generation limits
- **User Authentication**: Secure authentication via Supabase Auth
- **Dashboard**: View and manage all generated images
- **Image Sharing**: Download and share generated images on social media
- **Dark Mode Support**: Full dark/light theme support
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + Shadcn UI
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI Generation**: Replicate API
- **Payment**: Stripe
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Replicate API account
- Stripe account (for payments)
- PostgreSQL database

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PRO_PLAN_PRICE_ID=price_your_pro_plan_price_id_here
STRIPE_PREMIUM_PLAN_PRICE_ID=price_your_premium_plan_price_id_here

# Replicate Configuration
REPLICATE_API_KEY=r8_your_replicate_api_key_here

# Upstash Configuration (Optional - for MCP only)
UPSTASH_EMAIL=your_upstash_email_here
UPSTASH_API_KEY=your_upstash_api_key_here

# Resend Configuration (Optional - for email notifications)
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Environment Variables

#### Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon/public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)
5. Go to **Settings** → **Database**:
   - Copy **Connection Pooling** URI → `DATABASE_URL` (with `?pgbouncer=true`)
   - Copy **Direct Connection** URI → `DIRECT_URL` (without pgbouncer)

#### Replicate

1. Sign up at [Replicate](https://replicate.com/)
2. Go to **Account** → **API Tokens**
3. Create a new token → `REPLICATE_API_KEY`

#### Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from **Developers** → **API keys**:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. Create products and get price IDs from **Products**:
   - Pro plan price ID → `STRIPE_PRO_PLAN_PRICE_ID`
   - Premium plan price ID → `STRIPE_PREMIUM_PLAN_PRICE_ID`

#### Upstash (Optional)

1. Sign up at [Upstash](https://upstash.com/)
2. Get your API credentials from dashboard
3. Required only if using MCP (Model Context Protocol) features

#### Resend (Optional)

1. Sign up at [Resend](https://resend.com/)
2. Get your API key from **API Keys**
3. Verify your domain and set up a sender email
4. Required only if implementing email notifications

## 📦 Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd hero-time
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create `.env.local` file with the variables listed above

4. **Set up the database**

```bash
# Generate Prisma Client
npm run db:generate

# Push database schema
npm run db:push

# Or run migrations
npm run db:migrate
```

5. **Set up Supabase Storage**

- Create a bucket named `hero_props` in your Supabase project
- Make it publicly accessible
- Organize props in folders: `hands/`, `head/`, `body/`, `legs/`
- See [Props Storage Guide](./docs/PROPS_STORAGE_GUIDE.md) for details

6. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📁 Project Structure

```
hero-time/
├── docs/                          # Documentation
│   └── PROPS_STORAGE_GUIDE.md     # Guide for managing props
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Database migrations
├── public/                        # Static assets
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── generate-image/    # AI image generation
│   │   │   ├── generations/       # User generations CRUD
│   │   │   ├── stripe/            # Stripe implementation
│   │   │   └── upload-image/      # Image upload
│   │   ├── generate/              # Character builder page
│   │   │   ├── page.tsx           # Server component
│   │   │   └── GenerateClient.tsx # Client component
│   │   ├── dashboard/             # User dashboard
│   │   ├── settings/              # User settings
│   │   ├── pricing/               # Pricing page
│   │   ├── loading.tsx            # Global loading state
│   │   ├── error.tsx              # Global error handler
│   │   └── not-found.tsx          # 404 page
│   ├── components/
│   │   ├── generate/              # Character builder components
│   │   ├── homepage/              # Landing page sections
│   │   ├── layout/                # Layout components (Navbar, Sidebar)
│   │   ├── subscription/          # Subscription components
│   │   └── ui/                    # Shadcn UI components
│   ├── constants/                 # App constants
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Utilities and configurations
│   │   ├── propsLoader.ts         # Dynamic props loading
│   │   ├── supabase.ts            # Supabase client
│   │   ├── stripe.ts              # Stripe configuration
│   │   └── storage.ts             # Storage utilities
│   └── types/                     # TypeScript types
└── package.json
```

## 🎨 Adding New Props

Props are dynamically loaded from Supabase Storage. To add new props:

1. Upload images to the `hero_props` bucket in Supabase
2. Organize in folders: `hands/`, `head/`, `body/`, `legs/`
3. Use descriptive filenames (e.g., `magic_wand.png`)
4. The app automatically converts filenames to readable names

**📖 For detailed instructions, see [Props Storage Guide](./docs/PROPS_STORAGE_GUIDE.md)**

## 🔐 Database Schema

Key tables:

- `User`: User accounts and profiles
- `Subscription`: User subscription data
- `Generation`: Generated images history

Run Prisma Studio to view and edit data:

```bash
npm run db:studio
```

## 🎭 Subscription Tiers

| Plan    | Generations/Month | Custom Dimensions | 4K Quality | Price     |
| ------- | ----------------- | ----------------- | ---------- | --------- |
| Free    | 5                 | ❌                | ❌         | $0        |
| Pro     | 50                | ❌                | ❌         | $9.99/mo  |
| Premium | Unlimited         | ✅                | ✅         | $29.99/mo |

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to add all environment variables from `.env.local` to your production environment, updating:

## 🧪 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## 🐛 Troubleshooting

### Props Not Loading

- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check that `hero_props` bucket exists and is public
- Ensure proper folder structure in Supabase Storage

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Run `npm run db:generate` and `npm run db:push`
- Check Supabase database status

### AI Generation Failing

- Verify `REPLICATE_API_TOKEN` is valid
- Check Replicate account has sufficient credits
- Review API logs in Replicate dashboard

## 📚 Documentation

- [Props Storage Guide](./docs/PROPS_STORAGE_GUIDE.md) - Managing props in Supabase Storage
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [Replicate Documentation](https://replicate.com/docs)

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Replicate](https://replicate.com/) - AI Model Hosting
- [Shadcn UI](https://ui.shadcn.com/) - UI Components
- [Stripe](https://stripe.com/) - Payment Processing

## Screenshots

<img width="100%" alt="Screenshot 2026-01-11 at 19-41-44 HeroTime - Turn Your Photo Into The Hero Of Their Story" src="https://github.com/user-attachments/assets/0791c5e7-9532-46ea-bb84-a444b00c9ab8" />
<img width="100%" alt="Screenshot 2026-01-11 at 19-42-18 HeroTime - Turn Your Photo Into The Hero Of Their Story" src="https://github.com/user-attachments/assets/2bf59972-aae4-4792-88d7-94b33bfc933d" />
<img width="100%" alt="Screenshot 2026-01-11 at 19-43-46 HeroTime - Turn Your Photo Into The Hero Of Their Story" src="https://github.com/user-attachments/assets/3ad2fc28-46d7-4b5f-ad0c-cbdbcc5c1fd2" />
<img width="100%" alt="Screenshot 2026-01-11 at 19-47-21 HeroTime - Turn Your Photo Into The Hero Of Their Story" src="https://github.com/user-attachments/assets/9db4ccd2-d880-485e-a6c0-eaa84b41453f" />
<img width="100%" alt="Screenshot 2026-01-11 at 19-48-51 HeroTime - Turn Your Photo Into The Hero Of Their Story" src="https://github.com/user-attachments/assets/9dcac219-8b29-4d73-85a1-135897f69e6a" />
<img width="100%" alt="Screenshot 2026-01-11 at 19-50-21 HeroTime - Turn Your Photo Into The Hero Of Their Story" src="https://github.com/user-attachments/assets/7de33faa-0448-4baf-9d8f-c1423908b3ac" />
<img width="100%" alt="Screenshot 2026-01-11 at 19-51-22 HeroTime - Turn Your Photo Into The Hero Of Their Story" src="https://github.com/user-attachments/assets/b089672f-2ded-4dbd-809d-0b683ce5a1e2" />
<img width="100%" alt="Screenshot 2026-01-11 at 19-42-34 HeroTime - Turn Your Photo Into The Hero Of Their Story" src="https://github.com/user-attachments/assets/154127cc-5819-485d-81c4-5b4dfa186e25" />

---

**Made with ❤️ using Next.js and AI**
