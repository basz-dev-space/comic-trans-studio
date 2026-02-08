<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let form: { error?: string; email?: string };
</script>

<div class="flex min-h-[76vh] items-center justify-center py-6">
  <div class="w-full max-w-md">
    <div class="surface-card overflow-hidden">
      <div class="border-b border-[#dde2e9] bg-[#f8fafc] px-6 py-5">
        <p class="text-xs font-semibold uppercase tracking-[0.15em] text-[#7a8291]">{t($locale, 'login.demo')}</p>
        <h1 class="mt-1 text-3xl font-semibold text-[#171d27]">{t($locale, 'login.title')}</h1>
      </div>

      <form method="POST" class="space-y-4 p-6">
        <div class="rounded border border-[#d8dee7] bg-[#f8fafc] p-3 text-xs text-[#586173]">
          <p class="font-semibold">{t($locale, 'login.demoCredentials')}:</p>
          <p class="font-mono">demo@comictrans.local</p>
          <p class="font-mono">demo123</p>
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-[#242c39]" for="email">{t($locale, 'login.email')}</label>
          <Input id="email" name="email" type="email" required value={form?.email ?? ''} className="h-10 rounded border-[#ccd3dc] bg-white" />
        </div>

        <div class="space-y-1.5">
          <label class="text-sm font-semibold text-[#242c39]" for="password">{t($locale, 'login.password')}</label>
          <Input id="password" name="password" type="password" required className="h-10 rounded border-[#ccd3dc] bg-white" />
        </div>

        {#if form?.error}
          <div class="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            <p class="font-semibold">{t($locale, 'login.errorTitle')}</p>
            <p>{form.error}</p>
          </div>
        {/if}

        <Button type="submit" className="h-10 w-full rounded bg-[#ff8b31] text-sm font-semibold text-white hover:bg-[#f57e22]">{t($locale, 'login.title')}</Button>
      </form>

      <div class="border-t border-[#dde2e9] px-6 py-3 text-center text-xs text-[#6c7482]">
        {t($locale, 'login.demoAccess')}
      </div>
    </div>
  </div>
</div>
