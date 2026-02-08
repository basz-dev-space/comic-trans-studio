<script lang="ts">
  import { locale, t } from '$lib/i18n';
</script>

<svelte:head>
  <title>ComicTrans Studio | Workspace</title>
</svelte:head>

<main class="space-y-4 py-3">
  <section class="surface-card grid gap-5 p-6 lg:grid-cols-[1.2fr_1fr]">
    <div class="space-y-4">
      <p class="text-sm text-[#7a818f]">Secure, simple, seamless</p>
      <h1 class="text-display-lg max-w-[640px] leading-[0.95] text-[#151923]">
        <span class="text-[#ff8b31]">Fast-track</span><br />
        {t($locale, 'landing.title').replace('Translate faster with a cleaner, one-screen workflow.', 'to comic success')}
      </h1>
      <p class="max-w-[520px] text-sm text-[#687183]">{t($locale, 'landing.desc')}</p>
      <div class="flex flex-wrap gap-2">
        <a class="primary-btn" href="/projects">{t($locale, 'landing.cta.start')}</a>
        <a class="action-btn" href="/login">{t($locale, 'landing.cta.browse')}</a>
      </div>
    </div>

    <div class="rounded-lg border border-[#e2e5ea] bg-[#f7f9fc] p-4">
      <div class="mb-2 text-sm font-semibold text-[#2d3440]">Buy / Sell</div>
      <div class="space-y-2">
        <div class="rounded border border-[#dce1e8] bg-white p-2 text-xs text-[#555d6c]">You pay 0.001 BTC</div>
        <div class="rounded border border-[#dce1e8] bg-white p-2 text-xs text-[#555d6c]">You receive 102,896.90 USD</div>
        <button class="mt-2 w-full rounded bg-[#111] py-2 text-xs font-semibold text-white">BUY</button>
      </div>
    </div>
  </section>

  <section class="grid gap-3 md:grid-cols-3">
    <div class="surface-card p-5"><p class="text-4xl font-semibold">1M+</p><p class="text-xs text-[#6c7482]">Downloads</p></div>
    <div class="surface-card p-5"><p class="text-4xl font-semibold">500K+</p><p class="text-xs text-[#6c7482]">Active users</p></div>
    <div class="surface-card p-5"><p class="text-4xl font-semibold">$2B+</p><p class="text-xs text-[#6c7482]">Transactions secured</p></div>
  </section>

  <section class="surface-card grid gap-4 p-5 md:grid-cols-2">
    <div>
      <h3 class="text-heading-md">{t($locale, 'landing.kpi.editor')}</h3>
      <p class="mt-2 text-body-md text-[#6b7382]">{t($locale, 'landing.kpi.editorDesc')}</p>
    </div>
    <div class="rounded border border-[#dce1e8] bg-[#eff3f8] p-4 text-sm text-[#667084]">Visual workspace preview area</div>
  </section>

  <section class="surface-card p-5 text-center">
    <p class="text-sm text-[#7a818f]">Simplify comic translation</p>
    <h3 class="mt-1 text-3xl font-semibold">Multi-workflow support</h3>
    <div class="mt-4 inline-flex gap-2">
      <span class="rounded border border-[#d4dae2] bg-white px-4 py-2 text-sm">USDT</span>
      <span class="rounded border border-[#d4dae2] bg-white px-4 py-2 text-sm">ETH</span>
      <span class="rounded border border-[#d4dae2] bg-[#fff4e9] px-4 py-2 text-sm">BTC</span>
      <span class="rounded border border-[#d4dae2] bg-white px-4 py-2 text-sm">SOL</span>
    </div>
  </section>
</main>
