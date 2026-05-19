# LedgerZero

LedgerZero is a high-fidelity reconciliation dashboard designed for micro-businesses to clear invoice matches without manual data entry. It provides a visual, 3-column workspace to efficiently pair invoices with bank transactions, ensuring your books are always accurate with minimal effort.

## Features

- **Automated Reconciliation**: Exact amount matching logic to quickly pair payments with outstanding invoices.
- **Visual Workspace**: A modern, glassmorphic dashboard featuring a split-screen view of invoices and bank feeds.
- **Persistence**: Fully integrated with PostgreSQL via Prisma for reliable data management and tracking.
- **Containerized**: Ready for deployment anywhere with Docker and Docker Compose.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4 (OKLCH, Glassmorphism).
- **ORM**: Prisma 7.
- **Database**: PostgreSQL 15.
- **Orchestration**: Docker & Docker Compose.

## Quick Start

Follow these steps to get the project running locally using Docker:

### 1. Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Setup Environment
Copy the example environment file to create your local `.env`:
```bash
cp .env.example .env
```

### 3. Launch the Application
Run the following command to build and start the database and web services:
```bash
docker-compose up --build -d
```

Once the build is complete and the containers are running:
- **Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Database**: Port `5432`

The system will automatically run Prisma migrations and seed the database with initial data on startup.

## Development

If you wish to run the project outside of Docker:
1. Ensure you have a PostgreSQL instance running.
2. Update the `DATABASE_URL` in your `.env` to point to your local database.
3. Install dependencies: `cd ledgerzero-web && npm install`
4. Run migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

## License
Private / All Rights Reserved
