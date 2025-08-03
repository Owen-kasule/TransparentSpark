# Owen's Portfolio - Full Stack Developer Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Supabase. Features a comprehensive admin panel, blog system, email validation, analytics, and more.

![Portfolio Preview](https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800)

## 🚀 Features

### 🎨 **Frontend Features**
- **Modern Design**: Glass morphism UI with smooth animations
- **Responsive Layout**: Works perfectly on all devices
- **Dark Theme**: Elegant dark theme with azure accents
- **Interactive Components**: Hover effects, transitions, and micro-interactions
- **Performance Optimized**: Lazy loading, code splitting, and optimized assets

### 📝 **Blog System**
- **Full Blog Platform**: Complete blog with posts, comments, and analytics
- **Advanced Search**: Fuzzy search with relevance scoring
- **Comment System**: Threaded comments with moderation
- **Social Sharing**: Share posts across social platforms
- **Blog Analytics**: View tracking, like system, and engagement metrics

### 🔧 **Admin Panel**
- **Complete CMS**: Manage all content from a single dashboard
- **Page Management**: Edit all pages (Home, About, Projects, Contact, Blog)
- **Content Management**: Projects, reviews, blog posts, testimonials
- **Media Library**: File upload and management system
- **Analytics Dashboard**: Comprehensive analytics and reporting
- **Email Validator**: Advanced email validation using Abstract API
- **User Management**: GitHub OAuth authentication

### 📊 **Analytics & Monitoring**
- **Real-time Analytics**: Track page views, visitors, and engagement
- **Blog Analytics**: Post performance, views, likes, and comments
- **Geographic Data**: Visitor location tracking
- **Performance Monitoring**: Core Web Vitals and performance metrics

### 📧 **Email Features**
- **Contact Form**: Validated contact form with email verification
- **Review System**: Email-validated review submission
- **Abstract API Integration**: Professional email validation service

## 🏗️ Project Structure

```
owen-portfolio/
├── public/                          # Static assets
│   ├── hero-dark.jpg               # Hero background (dark theme)
│   ├── hero-light.jpg              # Hero background (light theme)
│   └── vite.svg                    # Vite logo
├── src/                            # Source code
│   ├── components/                 # React components
│   │   ├── admin/                  # Admin-specific components
│   │   │   └── EmailValidator.tsx  # Email validation tool
│   │   ├── blog/                   # Blog-related components
│   │   │   ├── BlogSearch.tsx      # Advanced blog search
│   │   │   ├── CommentSection.tsx  # Comment system
│   │   │   ├── RelatedPosts.tsx    # Related posts widget
│   │   │   └── SocialShare.tsx     # Social sharing buttons
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header.tsx          # Navigation header
│   │   │   ├── Footer.tsx          # Site footer
│   │   │   └── Layout.tsx          # Main layout wrapper
│   │   ├── reviews/                # Review system
│   │   │   └── AddReviewButton.tsx # Review submission modal
│   │   └── ui/                     # Reusable UI components
│   │       ├── GlassCard.tsx       # Glass morphism card
│   │       └── SocialLinks.tsx     # Social media links
│   ├── data/                       # Data and content
│   │   ├── blogData.ts             # Blog posts and comments
│   │   └── portfolio.ts            # Portfolio data (projects, testimonials)
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAnalytics.ts         # Analytics tracking hook
│   │   └── useBlogAnalytics.ts     # Blog analytics hook
│   ├── lib/                        # Utility libraries
│   │   ├── abstractEmailValidator.ts # Email validation service
│   │   ├── blogService.ts          # Blog data service
│   │   └── supabase.ts             # Supabase client and types
│   ├── pages/                      # Page components
│   │   ├── About.tsx               # About page
│   │   ├── Admin.tsx               # Admin dashboard
│   │   ├── Blog.tsx                # Blog listing page
│   │   ├── BlogPost.tsx            # Individual blog post
│   │   ├── Contact.tsx             # Contact page
│   │   ├── Home.tsx                # Homepage
│   │   └── Projects.tsx            # Projects showcase
│   ├── types/                      # TypeScript type definitions
│   │   └── index.ts                # Shared types
│   ├── App.tsx                     # Main App component
│   ├── index.css                   # Global styles and Tailwind
│   └── main.tsx                    # Application entry point
├── supabase/                       # Database migrations
│   └── migrations/                 # SQL migration files
├── .env                            # Environment variables
├── .env.example                    # Environment variables template
├── github-oauth-instructions.md    # GitHub OAuth setup guide
├── package.json                    # Dependencies and scripts
├── tailwind.config.js              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
└── README.md                       # This file
```

## 🛠️ Installation

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase account** (for database)
- **Abstract API account** (for email validation)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/owen-portfolio.git
cd owen-portfolio
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the environment template and configure your variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Abstract API Email Validation (Optional)
VITE_ABSTRACT_API_KEY=your_abstract_api_key
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Get your project URL and anon key from Settings > API

### 2. Run Database Migrations
The project includes SQL migrations in the `supabase/migrations/` directory:

1. **Install Supabase CLI** (optional, for local development):
   ```bash
   npm install -g supabase
   ```

2. **Apply Migrations Manually**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run each migration file in order:
     - `20250628083421_quiet_sea.sql` - Blog comments table
     - `20250628101307_emerald_boat.sql` - Blog system with analytics
     - `20250628102306_frosty_temple.sql` - Fix blog schema and functions

### 3. Database Schema Overview

#### Core Tables:
- **`reviews`** - User reviews and testimonials
- **`analytics`** - Page view tracking
- **`admin_users`** - Admin user management
- **`blog_posts`** - Blog articles and content
- **`blog_comments`** - Blog post comments
- **`blog_views`** - Blog post view tracking
- **`blog_likes`** - Blog post like system

#### Key Features:
- **Row Level Security (RLS)** enabled on all tables
- **Automatic timestamps** with triggers
- **Foreign key constraints** for data integrity
- **Indexes** for optimal query performance
- **Functions** for complex operations (views, likes, etc.)

### 4. Authentication Setup

#### GitHub OAuth Configuration:
1. **Create GitHub OAuth App**:
   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: `Owen Portfolio Admin`
     - Homepage URL: `https://your-domain.com`
     - Authorization callback URL: `https://your-supabase-url.supabase.co/auth/v1/callback`

2. **Configure Supabase Authentication**:
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable GitHub provider
   - Add your GitHub OAuth credentials

3. **Add Admin Users**:
   ```sql
   INSERT INTO admin_users (github_id, username, avatar_url, email)
   VALUES ('your-github-id', 'your-username', 'your-avatar-url', 'your-email');
   ```

## 📧 Email Validation Setup (Abstract API)

### 1. Get Abstract API Key
1. Sign up at [Abstract API](https://app.abstractapi.com)
2. Navigate to Email Validation API
3. Get your API key
4. Add it to your `.env` file

### 2. Features
- **Real-time email validation**
- **Deliverability checking**
- **Disposable email detection**
- **Typo correction suggestions**
- **Quality scoring**
- **Batch validation support**

## 🚀 Deployment

### Option 1: Netlify (Recommended)
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables in Netlify dashboard

### Option 2: Vercel
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 3: Manual Deployment
1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload the `dist` folder** to your hosting provider

### Environment Variables for Production
Make sure to set these in your deployment platform:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_ABSTRACT_API_KEY=your_abstract_api_key
```

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS with custom configuration:
- **Custom colors**: Azure theme colors
- **Custom fonts**: Inter and Space Grotesk
- **Custom animations**: Float, glow effects
- **Glass morphism utilities**: Custom backdrop blur effects

### TypeScript
Strict TypeScript configuration with:
- **Strict mode** enabled
- **Path mapping** for clean imports
- **Type safety** throughout the application

### Vite
Modern build tool configuration:
- **Fast HMR** (Hot Module Replacement)
- **Optimized builds** with code splitting
- **Asset optimization** and compression

## 📱 Features Deep Dive

### Admin Panel Capabilities
- **Page Content Management**: Edit all page content in real-time
- **Project Management**: Full CRUD operations for projects
- **Blog Management**: Create, edit, and manage blog posts
- **Review Moderation**: Approve/reject user reviews
- **Analytics Dashboard**: Comprehensive site analytics
- **Media Library**: File upload and management
- **Email Validation Tools**: Bulk email validation
- **User Management**: Admin user authorization

### Blog System Features
- **Advanced Search**: Fuzzy search with relevance scoring
- **Comment System**: Threaded comments with email validation
- **Social Sharing**: Share across multiple platforms
- **Analytics Tracking**: Views, likes, and engagement metrics
- **Related Posts**: Intelligent post recommendations
- **SEO Optimized**: Meta tags and structured data

### Performance Features
- **Lazy Loading**: Images and components load on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: Intelligent caching strategies
- **Optimized Images**: WebP format with fallbacks
- **Core Web Vitals**: Optimized for Google's performance metrics

## 🧪 Development

### Available Scripts
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Code Quality
- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and better developer experience
- **Prettier**: Code formatting (can be added)

### Testing (Future Enhancement)
The project is structured to easily add:
- **Unit tests** with Vitest
- **Integration tests** with Testing Library
- **E2E tests** with Playwright

## 🔒 Security

### Authentication
- **GitHub OAuth**: Secure admin authentication
- **Row Level Security**: Database-level security
- **Environment Variables**: Secure API key management

### Data Protection
- **Input Validation**: All forms have proper validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: Built-in with Supabase

## 📊 Analytics & Monitoring

### Built-in Analytics
- **Page Views**: Track visitor behavior
- **Geographic Data**: Visitor location tracking
- **Blog Analytics**: Post performance metrics
- **Real-time Data**: Live analytics updates

### Performance Monitoring
- **Core Web Vitals**: LCP, FID, CLS tracking
- **Error Tracking**: Client-side error monitoring
- **Performance Metrics**: Load times and user experience

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use semantic commit messages
- Add proper documentation for new features
- Ensure responsive design for all components
- Test on multiple browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling framework
- **Supabase** - Backend as a Service
- **Vite** - Build tool
- **Framer Motion** - Animations
- **Abstract API** - Email validation
- **Pexels** - Stock images

## 📞 Support

For support, email [owenatug@gmail.com](mailto:owenatug@gmail.com) or create an issue in the GitHub repository.

## 🔗 Links

- **Live Demo**: [Your deployed URL]
- **GitHub Repository**: [Your GitHub URL]
- **Documentation**: [Additional docs if any]

---

**Built with ❤️ by Owen Kasule**

*Full Stack Developer passionate about creating beautiful, functional web applications.*