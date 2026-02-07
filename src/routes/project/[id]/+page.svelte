<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let data: {
    project: { id: string; name: string };
    chapters: { id: string; name: string }[];
  };

  let expandedChapterId: string | null = null;

  const toggleRenameForm = (chapterId: string) => {
    expandedChapterId = expandedChapterId === chapterId ? null : chapterId;
  };
</script>

<div class="space-y-8 py-6 sm:py-8">
  <div class="flex flex-col items-start justify-between gap-4 sm:items-center sm:flex-row">
    <div>
      <p class="badge-label">{t($locale, 'project.badge')}</p>
      <h1 class="text-display-md mt-3 text-[#160204]">{data.project.name}</h1>
      <p class="text-body-md mt-2 text-[#5d3438]">{data.chapters.length} {t($locale, 'project.chapterCount')}</p>
    </div>
    <a class="inline-flex h-11 items-center justify-center gap-2 rounded-full border-2 border-[#e18e90] bg-white px-6 text-sm font-semibold text-[#e18e90] transition-all hover:bg-[#f5e8dd]" href="/projects">← {t($locale, 'project.back')}</a>
  </div>

  <form method="POST" action="?/createChapter" class="space-y-3">
    <label for="chapter-name" class="block text-sm font-semibold text-[#160204]">{t($locale, 'project.newChapter')}</label>
    <div class="flex flex-col gap-3 sm:flex-row">
      <Input id="chapter-name" name="name" required placeholder={t($locale, 'project.chapterPlaceholder')} className="flex-1 h-11 rounded-xl bg-[#fff9fa] border border-[#f0d2b8]" />
      <Button type="submit" className="h-11 rounded-xl bg-[#e18e90] hover:bg-[#d97b7d] text-white font-semibold shadow-elevation-1">{t($locale, 'project.newChapter')}</Button>
    </div>
  </form>

  <section class="space-y-3">
    {#if data.chapters.length === 0}
      <div class="rounded-2xl border-2 border-dashed border-[#f0d2b8] bg-[#fff0e8] px-8 py-12 text-center">
        <p class="mb-2 text-2xl font-bold text-[#160204]">{t($locale, 'project.emptyTitle')}</p>
        <p class="text-[#5d3438]">{t($locale, 'project.emptyDesc')}</p>
      </div>
    {:else}
      <ul class="space-y-3">
        {#each data.chapters as chapter, index}
          <li class="group">
            <div class="relative overflow-hidden rounded-2xl border border-[#f1d2b8] bg-white p-5 shadow-elevation-1 transition-all hover:shadow-elevation-2 hover:border-[#e18e90]">
              <div class="absolute inset-0 bg-gradient-to-r from-[#e18e90] to-transparent opacity-0 group-hover:opacity-5 transition-opacity"></div>

              <div class="relative z-10">
                <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f2bc56] text-sm font-bold text-[#160204]">{index + 1}</span>
                      <a class="text-heading-sm font-bold text-[#160204] hover:text-[#e18e90] transition-colors" href={`/project/chapter/${chapter.id}`}>{chapter.name}</a>
                    </div>
                    <p class="text-body-sm text-[#5d3438]">{t($locale, 'project.readyToEdit')}</p>
                  </div>

                  <div class="flex w-full gap-2 sm:w-auto sm:flex-wrap justify-start">
                    <a class="inline-flex h-10 items-center justify-center gap-1 rounded-full bg-[#e18e90] px-4 text-xs font-semibold text-white transition-all hover:bg-[#d97b7d]" href={`/project/chapter/${chapter.id}`}>{t($locale, 'project.open')} →</a>
                    <button
                      type="button"
                      on:click={() => toggleRenameForm(chapter.id)}
                      class="inline-flex h-10 items-center justify-center rounded-full border border-[#f0d2b8] px-4 text-xs font-semibold text-[#5d3438] transition-all hover:bg-[#fff2e3]"
                    >✏️ {t($locale, 'project.rename')}</button>
                    <form method="POST" action="?/deleteChapter" class="inline">
                      <input type="hidden" name="chapterId" value={chapter.id} />
                      <Button type="submit" variant="outline" className="h-10 rounded-full border-red-300 bg-red-50/80 text-red-600 hover:bg-red-100 text-xs">🗑️ {t($locale, 'project.delete')}</Button>
                    </form>
                  </div>
                </div>

                {#if expandedChapterId === chapter.id}
                  <div class="mt-4 pt-4 border-t border-[#f0d2b8]">
                    <form method="POST" action="?/renameChapter" class="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <input type="hidden" name="chapterId" value={chapter.id} />
                      <Input name="name" placeholder={t($locale, 'project.rename')} className="flex-1 h-10 rounded-lg bg-[#fff9fa] border border-[#f0d2b8] text-sm" />
                      <Button type="submit" className="h-10 rounded-lg bg-[#f2bc56] hover:bg-[#e6a844] text-[#160204] font-semibold text-sm">{t($locale, 'project.rename')}</Button>
                    </form>
                  </div>
                {/if}
              </div>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
</div>
