# FullHP

**FullHP** is a healthcare platform streamlining appointment booking and management for patients, doctors, and admins.

Initially built during **CodeWar 6.0** (under **Pyrokinesis 2025**) and further developed during **Google Solutions Challenge 2025**. Currently being overhauled into a fully functional, secure, accessible, and compliant system.

## Features

- Full end-to-end appointment booking and management
- Gemini powered medbot for preliminary diagnosis and specialist matching
- Patient view: appointment, medicine, and tests tracking
- Doctor view: weekly schedule and appointment management
- Full admin controls over all resources (patients, doctors, appointments)

## Tech Stack

- **Frontend**: React (Next.js), Tailwind CSS, shadcn/ui, Motion
- **Backend**: Next.js Route Handlers, Auth.js, Prisma, PostgreSQL
- **Tooling**: TypeScript, Zod, pnpm, Biome, Docker
- **AI Integration**: Google Gemini

## Credits

Currently being developed by: [Poran Dip](https://github.com/poran-dip)

Original Hackathon Team — **Cosmic Titans**:

- [Poran Dip](https://github.com/poran-dip)
- [Dikshyan Chakroborty](https://github.com/Dikshyan)
- [Rajdeep Choudhury](https://github.com/RajdeepChoudhury)
- [Hirok Jyoti Sarma](https://github.com/Hirak505)

## Local Setup

Prerequisites:

- Node 24+ (current LTS)
- PNPM 11+
- PostgreSQL
- Docker (recommended for production builds)

Clone the repositoy:

```bash
git clone https://github.com/poran-dip/fullhp.git
cd fullhp
```

Install dependencies and start dev server:

```bash
pnpm install
pnpm dev
```

Build for production:

```bash
docker compose up --build
```

Or, with pnpm:

```bash
pnpm build
pnpm start
```
