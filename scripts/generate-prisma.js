import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

console.log('Generating Prisma Client...');

try {
  const projectRoot = resolve(process.cwd());
  const schemaPath = resolve(projectRoot, 'prisma', 'schema.prisma');
  
  if (!existsSync(schemaPath)) {
    throw new Error('Prisma schema not found at: ' + schemaPath);
  }
  
  console.log('Schema found at:', schemaPath);
  console.log('Running: npx prisma generate');
  
  execSync('npx prisma generate', {
    cwd: projectRoot,
    stdio: 'inherit',
    encoding: 'utf-8'
  });
  
  console.log('');
  console.log('✓ Prisma Client generated successfully!');
  console.log('');
  
  // Check if client was created
  const clientPath = resolve(projectRoot, 'node_modules', '.prisma', 'client');
  if (existsSync(clientPath)) {
    console.log('✓ Verified: .prisma/client exists at', clientPath);
  } else {
    console.warn('Warning: .prisma/client directory not found');
  }
  
} catch (error) {
  console.error('');
  console.error('Error generating Prisma Client:');
  console.error(error.message);
  console.error('');
  process.exit(1);
}
