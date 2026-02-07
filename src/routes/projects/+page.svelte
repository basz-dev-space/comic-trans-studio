<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let data: { user: { id: string; name: string }; projects: { id: string; name: string }[] };
</script>

<div class="space-y-8 py-6 sm:py-8">
  <div class="space-y-4">
    <div class="flex flex-col items-start justify-between gap-4 sm:items-center sm:flex-row">
      <div>
        <p class="badge-label">{t($locale, 'projects.badge')}</p>
        <h1 class="text-display-md mt-3 text-[#160204]">{t($locale, 'projects.title')}</h1>
        <p class="text-body-md mt-2 text-[#5d3438]">{t($locale, 'projects.welcome')}, <span class="font-semibold text-[#160204]">{data.user.name}</span></p>
      </div>
      <a class="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#e18e90] bg-white px-6 text-sm font-semibold text-[#e18e90] transition-all hover:bg-[#f5e8dd]" href="/">{t($locale, 'nav.home')}</a>
    </div>
  </div>

  <form method="POST" action="?/createProject" class="space-y-3">
    <label for="project-name" class="block text-sm font-semibold text-[#160204]">{t($locale, 'projects.new')}</label>
    <div class="flex flex-col gap-3 sm:flex-row">
      <Input id="project-name" name="name" required placeholder={t($locale, 'projects.placeholder')} className="flex-1 h-11 rounded-xl bg-[#fff9fa] border border-[#f0d2b8]" />
      <Button type="submit" className="h-11 rounded-xl bg-[#e18e90] hover:bg-[#d97b7d] text-white font-semibold shadow-elevation-1">{t($locale, 'projects.new')}</Button>
    </div>
  </form>

  <section class="space-y-4">
    {#if data.projects.length === 0}
      <div class="rounded-2xl border-2 border-dashed border-[#f0d2b8] bg-[#fff0e8] px-8 py-12 text-center">
        <p class="text-2xl font-bold text-[#160204] mb-2">✨ Ready to create?</p>
        <p class="text-[#5d3438]">Start your first comic translation project above</p>
      </div>
    {:else}
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.projects as project}
          <div class="group relative overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white p-6 shadow-elevation-1 transition-all hover:shadow-elevation-3 hover:border-[#e18e90]">
            <div class="absolute inset-0 bg-gradient-to-br from-[#e18e90] to-transparent opacity-0 group-hover:opacity-5 transition-opacity"></div>
            <div class="relative z-10 space-y-4">
              <div>
                <h2 class="text-heading-md font-bold text-[#160204] group-hover:text-[#e18e90] transition-colors">{project.name}</h2>
                <p class="mt-2 text-body-md text-[#5d3438]">{t($locale, 'landing.kpi.projectsDesc')}</p>
              </div>
              <div class="flex items-center gap-3 pt-2">
                <div class="flex-1">
                  <span class="inline-block rounded-full bg-[#fff0e8] px-3 py-1 text-xs font-semibold text-[#e18e90]">Project</span>
                </div>
                <a class="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-[#e18e90] px-5 text-xs font-semibold text-white shadow-elevation-1 transition-all hover:bg-[#d97b7d] hover:shadow-elevation-2" href={`/project/${project.id}`}>
                  {t($locale, 'projects.open')} →
                </a>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
