// See https://kit.svelte.dev/docs/types#app
import type { User } from '$lib/server/repository/types';

declare global {
  namespace App {
    interface Locals {
      user: User | null;
    }
  }
}

export {};
