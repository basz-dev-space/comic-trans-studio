<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';

  export let data: {
    project: { id: string; name: string };
    chapters: { id: string; name: string }[];
  };
</script>

<div class="space-y-5 py-4 sm:py-6">
  <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d3438]">{t($locale, 'project.badge')}</p>
      <h1 class="text-2xl font-semibold text-[#160204]">{data.project.name}</h1>
    </div>
    <a class="inline-flex h-10 items-center justify-center rounded-3xl border border-[#f0d2b8] bg-white px-4 text-sm font-medium text-[#160204] hover:bg-[#fff2e3]" href="/projects">{t($locale, 'project.back')}</a>
  </Card>

  <form method="POST" action="?/createChapter">
    <Card className="flex flex-col gap-3 p-4 sm:flex-row">
      <Input name="name" required placeholder={t($locale, 'project.chapterPlaceholder')} className="flex-1" />
      <Button type="submit" className="rounded-3xl">{t($locale, 'project.newChapter')}</Button>
    </Card>
  </form>

  <ul class="space-y-3">
    {#each data.chapters as chapter}
      <li>
        <Card className="p-4">
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <a class="font-medium text-[#160204] hover:underline" href={`/project/chapter/${chapter.id}`}>{chapter.name}</a>
            <div class="flex flex-wrap items-center gap-2">
              <a class="inline-flex h-9 items-center justify-center rounded-3xl bg-[#e18e90] px-4 text-sm font-medium text-[#160204] hover:bg-[#d97b7d]" href={`/project/chapter/${chapter.id}`}>{t($locale, 'project.open')}</a>
              <form method="POST" action="?/renameChapter" class="flex items-center gap-2">
                <input type="hidden" name="chapterId" value={chapter.id} />
                <Input name="name" placeholder={t($locale, 'project.rename')} className="h-9 w-36" />
                <Button type="submit" variant="outline" className="h-9 rounded-3xl">{t($locale, 'project.rename')}</Button>
              </form>
              <form method="POST" action="?/deleteChapter">
                <input type="hidden" name="chapterId" value={chapter.id} />
                <Button type="submit" variant="outline" className="h-9 rounded-3xl border-red-300 bg-red-50/80 text-red-600 hover:bg-red-100">{t($locale, 'project.delete')}</Button>
              </form>
            </div>
          </div>
        </Card>
      </li>
    {/each}
  </ul>
</div>
