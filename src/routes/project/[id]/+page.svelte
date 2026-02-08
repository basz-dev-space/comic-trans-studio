<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let data: {
    project: { id: string; name: string };
    chapters: { id: string; name: string }[];
  };

  let expandedChapterId: string | null = null;
  const toggleRenameForm = (chapterId: string) => (expandedChapterId = expandedChapterId === chapterId ? null : chapterId);
</script>

<div class="space-y-4 py-3">
  <section class="surface-card p-5">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="badge-label">{t($locale, 'project.badge')}</p>
        <h1 class="mt-2 text-display-md text-[#161a22]">{data.project.name}</h1>
        <p class="mt-1 text-sm text-[#667083]">{data.chapters.length} {t($locale, data.chapters.length === 1 ? 'project.chapterCountOne' : 'project.chapterCount')}</p>
      </div>
      <a class="action-btn" href="/projects">← {t($locale, 'project.back')}</a>
    </div>
  </section>

  <form method="POST" action="?/createChapter" class="surface-card p-4">
    <label for="chapter-name" class="mb-2 block text-sm font-semibold text-[#222a35]">{t($locale, 'project.newChapter')}</label>
    <div class="flex flex-col gap-2 sm:flex-row">
      <Input id="chapter-name" name="name" required placeholder={t($locale, 'project.chapterPlaceholder')} className="h-10 flex-1 rounded border-[#ccd3dc] bg-white" />
      <Button type="submit" className="h-10 rounded bg-[#ff8b31] px-4 text-sm font-semibold text-white hover:bg-[#f57e22]">{t($locale, 'project.newChapter')}</Button>
    </div>
  </form>

  <section class="space-y-2">
    {#if data.chapters.length === 0}
      <div class="surface-card p-8 text-center">
        <p class="text-xl font-semibold text-[#171d27]">{t($locale, 'project.emptyTitle')}</p>
        <p class="mt-1 text-sm text-[#687283]">{t($locale, 'project.emptyDesc')}</p>
      </div>
    {:else}
      {#each data.chapters as chapter, index}
        <article class="surface-card p-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs text-[#768093]">Chapter {index + 1}</p>
              <a class="text-lg font-semibold text-[#1e2531] hover:text-[#ff8b31]" href={`/project/chapter/${chapter.id}`}>{chapter.name}</a>
            </div>
            <div class="flex flex-wrap gap-2">
              <a class="action-btn" href={`/project/chapter/${chapter.id}`}>{t($locale, 'project.open')}</a>
              <button type="button" class="action-btn" on:click={() => toggleRenameForm(chapter.id)}>{t($locale, 'project.rename')}</button>
              <form method="POST" action="?/deleteChapter" class="inline">
                <input type="hidden" name="chapterId" value={chapter.id} />
                <Button type="submit" variant="outline" className="h-9 rounded border-red-300 bg-red-50 px-3 text-xs text-red-600">{t($locale, 'project.delete')}</Button>
              </form>
            </div>
          </div>

          {#if expandedChapterId === chapter.id}
            <div class="mt-3 border-t border-[#e4e8ee] pt-3">
              <form method="POST" action="?/renameChapter" class="flex flex-col gap-2 sm:flex-row sm:items-end">
                <input type="hidden" name="chapterId" value={chapter.id} />
                <Input name="name" placeholder={t($locale, 'project.rename')} className="h-10 flex-1 rounded border-[#ccd3dc] bg-white" />
                <Button type="submit" className="h-10 rounded bg-[#ff8b31] px-4 text-sm font-semibold text-white hover:bg-[#f57e22]">Save</Button>
              </form>
            </div>
          {/if}
        </article>
      {/each}
    {/if}
  </section>
</div>
