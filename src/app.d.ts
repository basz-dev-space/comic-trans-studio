// See https://kit.svelte.dev/docs/types#app
import type { User } from '$lib/server/data';

declare global {
  namespace App {
    interface Locals {
      user: User | null;
    }
  }
}

export {};
