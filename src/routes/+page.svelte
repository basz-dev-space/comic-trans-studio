<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { locale, t } from '$lib/i18n';
</script>

<svelte:head>
  <title>ComicTrans Studio | Translate Comics Faster</title>
</svelte:head>

<main class="space-y-6 py-4 sm:py-8">
  <Card className="p-6 sm:p-10">
    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[#5d3438]">{t($locale, 'landing.badge')}</p>
    <h1 class="mt-3 max-w-5xl text-3xl font-bold leading-tight text-[#160204] sm:text-5xl">{t($locale, 'landing.title')}</h1>
    <p class="mt-4 max-w-3xl text-[#5d3438]">{t($locale, 'landing.desc')}</p>
    <div class="mt-7 flex flex-wrap gap-3">
      <a class="inline-flex h-11 items-center justify-center rounded-3xl bg-[#e18e90] px-4 text-sm font-medium text-[#160204] hover:bg-[#d97b7d]" href="/projects">{t($locale, 'landing.cta.start')}</a>
      <a class="inline-flex h-11 items-center justify-center rounded-3xl border border-[#f0d2b8] bg-white px-4 text-sm font-medium text-[#160204] hover:bg-[#fff2e3]" href="/login">{t($locale, 'landing.cta.browse')}</a>
    </div>
  </Card>

  <section class="grid gap-4 md:grid-cols-3">
    <Card className="p-6"><h2 class="font-semibold text-[#160204]">{t($locale, 'landing.kpi.projects')}</h2><p class="mt-2 text-sm text-[#5d3438]">{t($locale, 'landing.kpi.projectsDesc')}</p></Card>
    <Card className="p-6"><h2 class="font-semibold text-[#160204]">{t($locale, 'landing.kpi.editor')}</h2><p class="mt-2 text-sm text-[#5d3438]">{t($locale, 'landing.kpi.editorDesc')}</p></Card>
    <Card className="p-6"><h2 class="font-semibold text-[#160204]">{t($locale, 'landing.kpi.export')}</h2><p class="mt-2 text-sm text-[#5d3438]">{t($locale, 'landing.kpi.exportDesc')}</p></Card>
  </section>
</main>
