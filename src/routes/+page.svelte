<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { locale, t } from '$lib/i18n';
</script>

<svelte:head>
  <title>ComicTrans Studio | Translate Comics Faster</title>
</svelte:head>

<main class="space-y-10 py-6 sm:py-12">
  <section class="relative overflow-hidden rounded-[2rem] border border-[#f1d2b8] bg-gradient-soft px-6 py-12 sm:px-10 sm:py-16">
    <div class="relative z-10 max-w-4xl">
      <p class="badge-label">{t($locale, 'landing.badge')}</p>
      <h1 class="text-display-lg mt-4 text-[#160204]">{t($locale, 'landing.title')}</h1>
      <p class="text-body-lg mt-5 max-w-2xl text-[#5d3438]">{t($locale, 'landing.desc')}</p>
      <div class="mt-8 flex flex-wrap gap-4">
        <a class="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#e18e90] px-6 text-sm font-semibold text-white shadow-elevation-2 transition-all hover:bg-[#d97b7d] hover:shadow-elevation-3" href="/projects">{t($locale, 'landing.cta.start')} →</a>
        <a class="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#e18e90] bg-white px-6 text-sm font-semibold text-[#e18e90] transition-all hover:bg-[#f5e8dd]" href="/login">{t($locale, 'landing.cta.browse')}</a>
      </div>
    </div>
    <div class="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#f2bc56] opacity-20 blur-3xl"></div>
    <div class="absolute -bottom-16 right-1/4 h-32 w-32 rounded-full bg-[#e18e90] opacity-10 blur-3xl"></div>
  </section>

  <section class="grid gap-6 md:grid-cols-3">
    <div class="group relative overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white p-8 shadow-elevation-1 transition-all hover:shadow-elevation-2">
      <div class="absolute top-0 right-0 text-7xl font-bold text-[#f2bc56] opacity-10 group-hover:opacity-20 transition-opacity">01</div>
      <div class="relative z-10">
        <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e8]">
          <span class="text-2xl font-bold text-[#e18e90]">📁</span>
        </div>
        <h3 class="text-heading-md mb-3 text-[#160204]">{t($locale, 'landing.kpi.projects')}</h3>
        <p class="text-body-md text-[#5d3438] leading-relaxed">{t($locale, 'landing.kpi.projectsDesc')}</p>
      </div>
    </div>

    <div class="group relative overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white p-8 shadow-elevation-1 transition-all hover:shadow-elevation-2">
      <div class="absolute top-0 right-0 text-7xl font-bold text-[#f2bc56] opacity-10 group-hover:opacity-20 transition-opacity">02</div>
      <div class="relative z-10">
        <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e8]">
          <span class="text-2xl font-bold text-[#e18e90]">✏️</span>
        </div>
        <h3 class="text-heading-md mb-3 text-[#160204]">{t($locale, 'landing.kpi.editor')}</h3>
        <p class="text-body-md text-[#5d3438] leading-relaxed">{t($locale, 'landing.kpi.editorDesc')}</p>
      </div>
    </div>

    <div class="group relative overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white p-8 shadow-elevation-1 transition-all hover:shadow-elevation-2">
      <div class="absolute top-0 right-0 text-7xl font-bold text-[#f2bc56] opacity-10 group-hover:opacity-20 transition-opacity">03</div>
      <div class="relative z-10">
        <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0e8]">
          <span class="text-2xl font-bold text-[#e18e90]">📦</span>
        </div>
        <h3 class="text-heading-md mb-3 text-[#160204]">{t($locale, 'landing.kpi.export')}</h3>
        <p class="text-body-md text-[#5d3438] leading-relaxed">{t($locale, 'landing.kpi.exportDesc')}</p>
      </div>
    </div>
  </section>
</main>
