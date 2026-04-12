# Healify MVP

This repository contains the current Healify MVP foundation: public therapist discovery, soft booking, patient authentication, and a Moyasar-based payment flow for MVP validation.

## Prerequisites

- Node.js 20.19+ or newer
- npm
- PostgreSQL

## Setup

1. Copy `.env.example` to `.env`.
2. Update these environment variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `MOYASAR_SECRET_KEY`
   - `MOYASAR_PUBLISHABLE_KEY`
3. Install dependencies:

```bash
npm install
```

4. Generate Prisma Client:

```bash
npm run prisma:generate
```

5. Apply the Prisma migrations:

```bash
npm run prisma:migrate:dev
```

6. Seed the database:

```bash
npm run db:seed
```

7. Start the development server:

```bash
npm run dev
```

## Payment Notes

- Booking confirmation happens only after server-side verification of the returned Moyasar payment result.
- Returning from the payment page alone does not confirm the booking.
- The payment hold window remains 10 minutes; if it expires before successful verification, the booking is marked `EXPIRED` and the slot is released.
- Moyasar card form assets are loaded from Moyasar's hosted payment form package, and the provider secret key stays server-side only.

## General Notes

- Availability is stored in UTC in the database, with `timezone` retained on each slot for future booking-aware behavior.
- Therapist slugs are unique, English ASCII, and intended to remain immutable after creation.
- The current payment implementation follows Moyasar's hosted card flow and verifies payment details server-side before changing booking state.
