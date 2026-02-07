<script lang="ts">
  export let data: {
    project: { id: string; name: string };
    chapters: { id: string; name: string }[];
  };
</script>

<div class="min-h-full overflow-auto bg-slate-50 px-6 py-8">
  <div class="mx-auto max-w-5xl space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <p class="text-sm text-slate-500">Project</p>
        <h1 class="text-2xl font-bold">{data.project.name}</h1>
      </div>
      <a class="rounded-md border px-3 py-2 text-sm" href="/projects">Back to projects</a>
    </header>

    <form method="POST" action="?/createChapter" class="flex gap-2 rounded-lg border bg-white p-4">
      <input name="name" required class="flex-1 rounded-md border p-2" placeholder="New chapter name" />
      <button class="rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">Create chapter</button>
    </form>

    <ul class="space-y-3">
      {#each data.chapters as chapter}
        <li class="rounded-lg border bg-white p-4">
          <div class="flex items-center justify-between gap-3">
            <a class="font-medium hover:underline" href={`/project/chapter/${chapter.id}`}>{chapter.name}</a>
            <div class="flex items-center gap-2">
              <form method="POST" action="?/renameChapter" class="flex items-center gap-2">
                <input type="hidden" name="chapterId" value={chapter.id} />
                <input name="name" placeholder="Rename" class="rounded border px-2 py-1 text-sm" />
                <button class="rounded border px-2 py-1 text-sm" type="submit">Rename</button>
              </form>
              <form method="POST" action="?/deleteChapter">
                <input type="hidden" name="chapterId" value={chapter.id} />
                <button class="rounded border border-red-300 px-2 py-1 text-sm text-red-600" type="submit">Delete</button>
              </form>
            </div>
          </div>
        </li>
      {/each}
    </ul>
  </div>
</div>
