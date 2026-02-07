<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let data: { user: { id: string; name: string }; projects: { id: string; name: string }[] };
</script>

<div class="space-y-5 py-4 sm:py-6">
  <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d3438]">{t($locale, 'projects.badge')}</p>
      <h1 class="text-2xl font-semibold text-[#160204]">{t($locale, 'projects.title')}</h1>
      <p class="text-sm text-[#5d3438]">{t($locale, 'projects.welcome')}, {data.user.name}</p>
    </div>
    <a href="/"><Button variant="outline" className="rounded-3xl">{t($locale, 'nav.home')}</Button></a>
  </Card>

  <form method="POST" action="?/createProject">
    <Card className="flex flex-col gap-3 p-4 sm:flex-row">
      <Input name="name" required placeholder={t($locale, 'projects.placeholder')} className="flex-1" />
      <Button type="submit" className="rounded-3xl">{t($locale, 'projects.new')}</Button>
    </Card>
  </form>

  <section class="grid gap-4 md:grid-cols-2">
    {#each data.projects as project}
      <Card className="p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-semibold text-[#160204]">{project.name}</h2>
            <p class="mt-2 text-sm text-[#5d3438]">{t($locale, 'landing.kpi.projectsDesc')}</p>
          </div>
          <a href={`/project/${project.id}`}><Button className="rounded-3xl">{t($locale, 'projects.open')}</Button></a>
        </div>
      </Card>
    {/each}
  </section>
</div>
