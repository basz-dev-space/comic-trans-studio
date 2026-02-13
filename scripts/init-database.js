/**
 * Initialize Prisma database for Comic Translation Studio
 * 
 * This script:
 * 1. Generates the Prisma Client
 * 2. Creates the SQLite database
 * 3. Runs migrations to set up all tables
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cwd } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

console.log('🔧 Initializing Comic Translation Studio Database...');
console.log('');

try {
  // Step 1: Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', {
    cwd: projectRoot,
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  console.log('✅ Prisma Client generated successfully');
  console.log('');

  // Step 2: Check if database exists
  const dbPath = resolve(projectRoot, 'prisma', 'dev.db');
  const dbExists = existsSync(dbPath);
  
  if (dbExists) {
    console.log('📊 Database file exists at prisma/dev.db');
    console.log('🔄 Running migrations to ensure schema is up to date...');
  } else {
    console.log('🆕 Creating new database at prisma/dev.db...');
  }

  // Step 3: Push database schema (creates tables)
  execSync('npx prisma db push --skip-generate', {
    cwd: projectRoot,
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  
  console.log('');
  console.log('✅ Database initialized successfully!');
  console.log('');
  console.log('📋 Summary:');
  console.log('   - Prisma Client: Generated');
  console.log('   - Database: Ready');
  console.log('   - Tables: Created');
  console.log('');
  console.log('🚀 You can now start the application!');
  console.log('');

} catch (error) {
  console.error('');
  console.error('❌ Error initializing database:', error.message);
  process.exit(1);
}
