import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

console.log('Setting up database...');
console.log('');

try {
  const projectRoot = resolve(process.cwd());
  const dbPath = resolve(projectRoot, 'prisma', 'dev.db');
  
  // Step 1: Generate Prisma Client
  console.log('Step 1: Generating Prisma Client...');
  execSync('npx prisma generate', {
    cwd: projectRoot,
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  console.log('✓ Prisma Client generated');
  console.log('');
  
  // Step 2: Push database schema
  console.log('Step 2: Creating/updating database schema...');
  if (existsSync(dbPath)) {
    console.log('Database exists at:', dbPath);
    console.log('Updating schema...');
  } else {
    console.log('Creating new database at:', dbPath);
  }
  
  execSync('npx prisma db push --skip-generate', {
    cwd: projectRoot,
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  console.log('✓ Database schema applied');
  console.log('');
  
  console.log('✓ Database setup complete!');
  console.log('');
  console.log('Summary:');
  console.log('  - Prisma Client: Generated');
  console.log('  - Database: Ready');
  console.log('  - Schema: Applied');
  console.log('');
  console.log('You can now start the development server with: npm run dev');
  console.log('');
  
} catch (error) {
  console.error('');
  console.error('Error setting up database:');
  console.error(error.message);
  console.error('');
  console.error('If this is a permissions issue, try running:');
  console.error('  npm run db:generate');
  console.error('  npm run db:push');
  console.error('');
  process.exit(1);
}
