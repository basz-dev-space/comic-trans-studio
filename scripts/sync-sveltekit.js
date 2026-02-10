import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function syncSvelteKit() {
  try {
    console.log('Running svelte-kit sync...');
    const { stdout, stderr } = await execAsync('npx svelte-kit sync');
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    console.log('✓ SvelteKit sync completed successfully!');
    console.log('The .svelte-kit directory has been generated.');
  } catch (error) {
    console.error('Error running svelte-kit sync:', error.message);
    process.exit(1);
  }
}

syncSvelteKit();
