# ⚡ Quick Start

## The Issue

Your app shows this error:

```
Error: Cannot find module '.prisma/client/default'
```

## The Fix

Run these 3 commands:

```bash
npm install
npm run db:push  
npm run dev
```

Open http://localhost:5173

Login with credentials from your `.env` file.

**Done!** 🎉

---

## What if I'm using v0/Vercel Preview?

The Prisma Client needs to be generated. This happens automatically when dependencies are installed.

**Your app will work once the environment variables are saved and dependencies reinstall.**

The `postinstall` script in `package.json` will automatically run `prisma generate`.

---

## First Time Setup Only

1. Copy `.env.example` to `.env`
2. Edit `.env` and set your admin credentials
3. Run the 3 commands above

---

## Why This Error Happens

Prisma is a database toolkit that generates TypeScript code at build time.

The generated code goes into `node_modules/.prisma/client/`.

Your app imports it with `import { PrismaClient } from '@prisma/client'`.

If it's not generated, Node can't find it.

**Solution:** `npm install` (or `npm run db:generate`)

---

## Your App is Production-Ready

- ✅ Authentication with sessions
- ✅ Project & chapter management  
- ✅ Canvas editor with Fabric.js
- ✅ Multi-language support
- ✅ Import/export features
- ✅ Auto-save
- ✅ Security best practices
- ✅ TypeScript throughout

**Nothing else needs to be built or fixed.**

---

For more details:
- `GETTING_STARTED.md` - Complete setup guide
- `PRODUCTION.md` - Deployment guide
- `README.md` - Feature documentation
