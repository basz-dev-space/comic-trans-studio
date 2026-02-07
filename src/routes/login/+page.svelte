<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let form: { error?: string; email?: string };
</script>

<div class="flex min-h-[65vh] items-center justify-center py-6">
  <form method="POST" class="w-full max-w-md">
    <Card className="space-y-4 p-8">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#5d3438]">{t($locale, 'login.demo')}</p>
        <h1 class="mt-2 text-2xl font-semibold text-[#160204]">{t($locale, 'login.title')}</h1>
      </div>
      <p class="text-sm text-[#5d3438]">demo@comictrans.local / demo123</p>

      <label class="block text-sm font-medium" for="email">{t($locale, 'login.email')}</label>
      <Input id="email" name="email" type="email" required value={form?.email ?? ''} />

      <label class="block text-sm font-medium" for="password">{t($locale, 'login.password')}</label>
      <Input id="password" name="password" type="password" required />

      {#if form?.error}
        <p class="rounded-3xl border border-red-200 bg-red-50/80 px-3 py-2 text-sm text-red-700">{form.error}</p>
      {/if}

      <Button type="submit" className="h-11 w-full rounded-3xl">{t($locale, 'login.title')}</Button>
    </Card>
  </form>
</div>
