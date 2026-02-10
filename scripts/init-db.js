import { execSync } from 'child_process';

console.log('🔄 Initializing database...');

try {
  // Generate Prisma Client
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: '/vercel/share/v0-project'
  });
  
  // Push schema to database (creates database if it doesn't exist)
  console.log('🗄️  Pushing schema to database...');
  execSync('npx prisma db push --skip-generate', { 
    stdio: 'inherit',
    cwd: '/vercel/share/v0-project'
  });
  
  console.log('✅ Database initialized successfully!');
} catch (error) {
  console.error('❌ Database initialization failed:', error.message);
  process.exit(1);
}
