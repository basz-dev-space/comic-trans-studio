<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let data: { user: { id: string; name: string }; projects: { id: string; name: string }[] };
</script>

<div class="space-y-4 py-3">
  <section class="surface-card p-5">
    <p class="badge-label">{t($locale, 'projects.badge')}</p>
    <h1 class="mt-2 text-display-md text-[#161a22]">{t($locale, 'projects.title')}</h1>
    <p class="mt-1 text-sm text-[#656f7f]">{t($locale, 'projects.welcome')}, <span class="font-semibold text-[#1f2632]">{data.user.name}</span></p>
  </section>

  <form method="POST" action="?/createProject" class="surface-card p-4">
    <label for="project-name" class="mb-2 block text-sm font-semibold text-[#242b36]">{t($locale, 'projects.new')}</label>
    <div class="flex flex-col gap-2 sm:flex-row">
      <Input id="project-name" name="name" required placeholder={t($locale, 'projects.placeholder')} className="h-10 flex-1 rounded border-[#ccd3dc] bg-white" />
      <Button type="submit" className="h-10 rounded bg-[#ff8b31] px-4 text-sm font-semibold text-white hover:bg-[#f57e22]">{t($locale, 'projects.new')}</Button>
    </div>
  </form>

  <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {#if data.projects.length === 0}
      <div class="surface-card col-span-full p-8 text-center">
        <p class="text-xl font-semibold text-[#171d27]">{t($locale, 'projects.emptyTitle')}</p>
        <p class="mt-1 text-sm text-[#687283]">{t($locale, 'projects.emptyDesc')}</p>
      </div>
    {:else}
      {#each data.projects as project}
        <article class="surface-card p-4">
          <p class="text-xs text-[#798294]">{t($locale, 'projects.projectLabel')}</p>
          <h3 class="mt-1 text-lg font-semibold text-[#1f2632]">{project.name}</h3>
          <div class="mt-3 flex items-center justify-between">
            <span class="rounded bg-[#eef2f7] px-2 py-1 text-xs text-[#667086]">Active</span>
            <a class="action-btn" href={`/project/${project.id}`}>{t($locale, 'projects.open')} →</a>
          </div>
        </article>
      {/each}
    {/if}
  </section>
</div>
