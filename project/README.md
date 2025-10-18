# Hackathon Template

A full-stack template for hackathons built with modern technologies. This template provides a solid foundation for building web applications with authentication, database, and a beautiful UI.

## 🚀 Features

- **Next.js 15** with App Router and TypeScript
- **NextAuth.js** with Google OAuth authentication
- **Prisma** ORM with SQLite database (easily switchable to PostgreSQL)
- **Tailwind CSS** for styling
- **Responsive Design** with modern UI components
- **Type Safety** with TypeScript throughout

## 📁 Project Structure

```
hackathon-template/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/auth/          # NextAuth.js API routes
│   │   ├── auth/signin/       # Sign-in page
│   │   ├── dashboard/         # Main dashboard
│   │   ├── profile/           # User profile page
│   │   └── settings/          # Settings page
│   ├── components/            # Reusable components
│   └── lib/                   # Utility functions and configurations
├── prisma/
│   └── schema.prisma          # Database schema
└── public/                    # Static assets
```

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd hackathon-template
npm install
```

### 2. Environment Configuration

1. Copy the environment template:
   ```bash
   cp env.template .env.local
   ```

2. Fill in your environment variables in `.env.local`:

   **Required:**
   - `NEXTAUTH_SECRET`: Generate a random secret key
   - `GOOGLE_CLIENT_ID`: Get from Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: Get from Google Cloud Console

   **Optional:**
   - `NEXTAUTH_URL`: Set to your domain for production

### 3. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret to your `.env.local` file

### 4. Database Setup

The template uses SQLite by default (no additional setup required). For PostgreSQL:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Add `DATABASE_URL` to your `.env.local`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎨 Customization

### Adding New Pages

1. Create a new page in `src/app/your-page/page.tsx`
2. Add navigation links in the existing pages
3. Use the existing layout patterns for consistency

### Styling

- All styling uses Tailwind CSS classes
- Custom styles can be added to `src/app/globals.css`
- The template includes a responsive design system

### Database Models

Add new models to `prisma/schema.prisma`:

```prisma
model YourModel {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Add your fields here
}
```

Then run:
```bash
npx prisma migrate dev --name add-your-model
npx prisma generate
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

- **Netlify**: Use `@netlify/plugin-nextjs`
- **Railway**: Connect GitHub repository
- **Heroku**: Add `next` buildpack

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Run database migrations
- `npx prisma generate` - Generate Prisma client

## 🔧 Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Make sure your Google OAuth redirect URI matches exactly
2. **Database connection errors**: Check your `DATABASE_URL` format
3. **NextAuth errors**: Verify your `NEXTAUTH_SECRET` is set

### Getting Help

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📄 License

This template is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy Hacking! 🎉**