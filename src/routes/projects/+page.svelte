<script lang="ts">
  export let data: { user: { id: string; name: string }; projects: { id: string; name: string }[] };
</script>

<div class="min-h-full overflow-auto bg-slate-50 px-6 py-8">
  <div class="mx-auto max-w-5xl space-y-6">
    <header class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Projects</h1>
        <p class="text-sm text-slate-600">Welcome, {data.user.name}</p>
      </div>
      <a class="rounded-md border px-3 py-2 text-sm" href="/">Landing</a>
    </header>

    <form method="POST" action="?/createProject" class="flex gap-2 rounded-lg border bg-white p-4">
      <input name="name" required class="flex-1 rounded-md border p-2" placeholder="Project name" />
      <button class="rounded-md bg-slate-900 px-4 py-2 text-white" type="submit">+ New Project</button>
    </form>

    <section class="grid gap-4 md:grid-cols-2">
      {#each data.projects as project}
        <a class="rounded-lg border bg-white p-5 hover:border-slate-900" href={`/project/${project.id}`}>
          <h2 class="font-semibold">{project.name}</h2>
          <p class="mt-2 text-sm text-slate-600">Open chapters</p>
        </a>
      {/each}
    </section>
  </div>
</div>
