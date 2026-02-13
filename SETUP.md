# Database Setup Required

## Error: Cannot find module '.prisma/client/default'

This error occurs because the Prisma Client hasn't been generated yet. The Prisma Client is auto-generated code that provides type-safe database access.

## How to Fix

Run the following commands in your terminal:

```bash
# Option 1: Run the combined init command
npm run db:init

# Option 2: Run commands separately  
npm run db:generate   # Generates Prisma Client
npm run db:push       # Creates database tables
```

After running these commands, the `.prisma/client` module will be created and the application will work properly.

## What These Commands Do

- **`npm run db:generate`** - Generates the Prisma Client TypeScript code based on your `prisma/schema.prisma` file. This creates the `.prisma/client` directory with all the type-safe database query methods.

- **`npm run db:push`** - Pushes your Prisma schema to the SQLite database, creating all the necessary tables (User, Session, Project, Chapter, Page, TextBox).

## Why This Happens

Prisma Client is generated code that's not committed to git (it's in `.gitignore` under `node_modules`). Every developer needs to generate it locally after cloning the repository or when the schema changes.

## Automatic Generation

The `package.json` includes a `postinstall` script that should automatically run `prisma generate` after `npm install`. However, in some environments this may not run automatically, so you may need to run it manually.

## For Development

The `.env` file is already configured with:
- `DATABASE_URL=file:./prisma/dev.db` (SQLite database)
- Default admin credentials for testing

See `README.md` for complete setup instructions.
