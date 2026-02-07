<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let form: { error?: string; email?: string };
</script>

<div class="flex min-h-[80vh] items-center justify-center py-8">
  <div class="w-full max-w-md">
    <div class="overflow-hidden rounded-[2rem] border border-[#f1d2b8] bg-white shadow-elevation-2">
      <div class="relative overflow-hidden bg-gradient-to-br from-[#e18e90] to-[#d97b7d] px-8 py-12 text-white sm:py-16">
        <div class="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white opacity-10"></div>
        <div class="relative z-10">
          <p class="text-sm font-semibold uppercase tracking-widest opacity-90">{t($locale, 'login.demo')}</p>
          <h1 class="mt-3 text-3xl font-bold">{t($locale, 'login.title')}</h1>
        </div>
      </div>

      <form method="POST" class="space-y-5 p-8">
        <div class="rounded-lg bg-[#fff0e8] border border-[#f3d7be] p-3">
          <p class="mb-1 text-xs font-medium text-[#5d3438]">{t($locale, 'login.demoCredentials')}:</p>
          <p class="text-sm font-mono text-[#160204]">demo@comictrans.local</p>
          <p class="text-sm font-mono text-[#160204]">demo123</p>
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-[#160204]" for="email">{t($locale, 'login.email')}</label>
          <Input id="email" name="email" type="email" required value={form?.email ?? ''} className="h-11 rounded-xl bg-[#fff9fa] border border-[#f0d2b8] focus:border-[#e18e90]" />
        </div>

        <div class="space-y-2">
          <label class="block text-sm font-semibold text-[#160204]" for="password">{t($locale, 'login.password')}</label>
          <Input id="password" name="password" type="password" required className="h-11 rounded-xl bg-[#fff9fa] border border-[#f0d2b8] focus:border-[#e18e90]" />
        </div>

        {#if form?.error}
          <div class="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p class="mb-1 font-semibold">{t($locale, 'login.errorTitle')}</p>
            <p>{form.error}</p>
          </div>
        {/if}

        <Button type="submit" className="h-11 w-full rounded-xl bg-[#e18e90] hover:bg-[#d97b7d] text-white font-semibold shadow-elevation-1">{t($locale, 'login.title')}</Button>
      </form>

      <div class="border-t border-[#f0d2b8] px-8 py-4 text-center text-xs text-[#5d3438]">
        <p>{t($locale, 'login.demoAccess')}</p>
      </div>
    </div>
  </div>
</div>
