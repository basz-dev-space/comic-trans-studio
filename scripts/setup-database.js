import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

async function setupDatabase() {
  console.log('[setup] Starting database setup...');

  try {
    // Ensure prisma directory exists
    const prismaDir = resolve(projectRoot, 'prisma');
    if (!existsSync(prismaDir)) {
      console.log('[setup] Creating prisma directory...');
      mkdirSync(prismaDir, { recursive: true });
    }

    // Run Prisma generate
    console.log('[setup] Generating Prisma Client...');
    const { stdout: genStdout, stderr: genStderr } = await execAsync('npx prisma generate', {
      cwd: projectRoot,
      env: { ...process.env, DATABASE_URL: 'file:./prisma/dev.db' }
    });
    if (genStdout) console.log(genStdout);
    if (genStderr) console.warn(genStderr);

    // Run Prisma migrate deploy (or db push for development)
    console.log('[setup] Setting up database schema...');
    const { stdout: pushStdout, stderr: pushStderr } = await execAsync('npx prisma db push', {
      cwd: projectRoot,
      env: { ...process.env, DATABASE_URL: 'file:./prisma/dev.db' }
    });
    if (pushStdout) console.log(pushStdout);
    if (pushStderr) console.warn(pushStderr);

    console.log('[setup] ✅ Database setup complete!');
    console.log('[setup] Database location: ./prisma/dev.db');
  } catch (error) {
    console.error('[setup] ❌ Database setup failed:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    process.exit(1);
  }
}

setupDatabase();
