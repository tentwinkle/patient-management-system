# Patient Management System

A comprehensive Patient Management System built with Next.js, tRPC, Prisma, and Supabase. Features role-based authentication, CRUD operations, and a modern responsive UI.

## 🚀 Features

- **Authentication**: JWT-based authentication with NextAuth and bcrypt password hashing
- **Role-based Access Control**: Admin and User roles with different permissions
- **CRUD Operations**: Complete patient management functionality
- **Responsive Design**: Modern UI that works on all devices
- **Type Safety**: End-to-end type safety with TypeScript and tRPC
- **Database**: PostgreSQL with Prisma ORM
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: tRPC, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: NextAuth.js with bcrypt
- **Styling**: Tailwind CSS, shadcn/ui
- **Deployment**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Supabase account)
- Docker (optional, for containerized deployment)

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd patient-management-system
\`\`\`

### 2. Install Dependencies

\`\`\`bash
pnpm install
\`\`\`

### 3. Environment Setup

Copy the example environment file and update the values:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Update the following environment variables:

\`\`\`env
DATABASE_URL="postgresql://username:password@localhost:5432/patient_management"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
\`\`\`

### 4. Database Setup

#### Generate Prisma client
```npx prisma generate``` or ```npm run db:generate```

#### Push database schema
```npx prisma db push``` or ```npm run db:push```

#### Seed the database with demo users and patients
```npm run db:seed```


### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🐳 Running with Docker Compose

Prefer to use containers? Spin everything up with Docker Compose:

```bash
# Build the images and start the services
docker-compose up --build

# (optional) run in the background
docker-compose up -d --build
```

Once the stack is running you can seed demo data:

```bash
docker-compose exec app npm run db:seed
```

The app will be available at **http://localhost:3000** and Postgres at **localhost:5432**.

Shut everything down with:

```bash
docker-compose down
```

## 👥 Demo Accounts

After running the seed script, you can use these demo accounts:

- **Admin**: `admin@example.com` / `admin123`
- **User**: `user@example.com` / `user123`

## 🔐 Authentication & Authorization

### Roles

- **Admin**: Full CRUD access to patient records
- **User**: Read-only access to patient records

### Authentication Methods

- Email/Password with bcrypt password hashing
- Demo accounts created via database seeding

## 📱 Features Overview

### Patient Management
- View all patients in a responsive table
- Add new patients (Admin only)
- Edit existing patients (Admin only)
- Delete patients (Admin only)
- Search and filter capabilities

### User Interface
- Responsive design for mobile, tablet, and desktop
- Modern UI with shadcn/ui components
- Dark/light mode support
- Intuitive navigation and user experience

### Security
- JWT-based authentication
- Bcrypt password hashing
- Role-based access control
- Input validation and sanitization
- CSRF protection

## 🏗 Architecture

### Backend Architecture
\`\`\`
├── server/
│   ├── routers/          # tRPC routers
│   └── trpc.ts          # tRPC configuration
├── lib/
│   ├── auth.ts          # NextAuth configuration
│   └── prisma.ts        # Prisma client
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
\`\`\`

### Frontend Architecture
\`\`\`
├── pages/               # Next.js pages
├── components/          # React components
│   ├── layout/         # Layout components
│   ├── patients/       # Patient-specific components
│   └── ui/             # shadcn/ui components
└── lib/
    └── trpc.ts         # tRPC client configuration
\`\`\`

## 🌱 Database Seeding

The seed script creates:
- 2 demo users (admin and regular user)
- 7 sample patients with realistic data

Run seeding with:

```npm run db:seed```

## 🧪 Testing

#### Run unit tests

```npm run test```

## 📦 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy
5. Run database migrations and seeding

### Manual Deployment

#### Build the application
```npm run build```

#### Start production server
```npm start```



## 🔄 Future Enhancements

- [ ] Advanced search and filtering
- [ ] Patient medical history tracking
- [ ] Appointment scheduling
- [ ] Email notifications
- [ ] Export functionality (PDF, CSV)
- [ ] Audit logging
- [ ] Multi-tenant support
