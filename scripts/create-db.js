import { readFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

// Get the directory where this script is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

const dbPath = resolve(projectRoot, 'prisma/dev.db');
const sqlPath = resolve(__dirname, 'init-database.sql');

// Ensure the prisma directory exists
const dir = dirname(dbPath);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
  console.log(`✅ Created directory: ${dir}`);
}

// Create or open the database
const db = new Database(dbPath);
console.log(`✅ Database file created/opened at: ${dbPath}`);

// Read and execute the SQL script
const sql = readFileSync(sqlPath, 'utf8');
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📝 Executing ${statements.length} SQL statements...`);

for (const statement of statements) {
  try {
    db.exec(statement);
  } catch (error) {
    console.error(`❌ Error executing statement: ${error.message}`);
    console.error(`Statement: ${statement.substring(0, 100)}...`);
  }
}

db.close();
console.log('✅ Database initialized successfully!');
