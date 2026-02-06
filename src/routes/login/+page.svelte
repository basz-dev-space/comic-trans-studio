<script lang="ts">
  export let form: { error?: string; email?: string };
</script>

<div class="flex min-h-full items-center justify-center bg-slate-50 px-4">
  <form method="POST" class="w-full max-w-md space-y-4 rounded-xl border bg-white p-8 shadow-sm">
    <h1 class="text-2xl font-bold">Login</h1>
    <p class="text-sm text-slate-600">Use <strong>demo@comictrans.local</strong> / <strong>demo123</strong></p>

    <label class="block text-sm font-medium" for="email">Email</label>
    <input id="email" name="email" type="email" required value={form?.email ?? ''} class="w-full rounded-md border p-2" />

    <label class="block text-sm font-medium" for="password">Password</label>
    <input id="password" name="password" type="password" required class="w-full rounded-md border p-2" />

    {#if form?.error}
      <p class="text-sm text-red-600">{form.error}</p>
    {/if}

    <button class="w-full rounded-md bg-slate-900 px-4 py-2 font-medium text-white" type="submit">
      Sign in
    </button>
  </form>
</div>
