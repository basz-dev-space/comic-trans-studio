<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { locale, t } from '$lib/i18n';
  import { Search, ArrowUpDown, ArrowUp, ArrowDown, Trash2 } from 'lucide-svelte';
  import { enhance } from '$app/forms';

  export let users: Array<{ id: string; email: string; name: string; createdAt: string }> = [];

  let searchQuery = '';
  let sortKey: 'email' | 'name' | 'createdAt' = 'createdAt';
  let sortDirection: 'asc' | 'desc' = 'desc';
  let currentPage = 1;
  const pageSize = 10;

  $: filteredUsers = users
    .filter((user) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return user.email.toLowerCase().includes(q) || user.name.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (sortKey === 'createdAt') {
        return sortDirection === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }
      return sortDirection === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  $: totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  $: startPage = Math.min(currentPage, Math.max(1, totalPages - 4));
  $: endPage = Math.min(totalPages, startPage + 4);
  $: pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  $: paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDirection = 'asc';
    }
  }

  function goToPage(page: number) {
    currentPage = Math.max(1, Math.min(page, totalPages));
  }
</script>

<div class="space-y-4">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <div class="relative min-w-[200px] flex-1 max-w-md">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a94a5]" />
      <Input
        className="h-10 border-[#ccd3dc] bg-white pl-10"
        bind:value={searchQuery}
        placeholder={t($locale, 'admin.searchUsers')}
      />
    </div>
    
    <div class="text-sm text-[#707684]">
      {filteredUsers.length} {t($locale, 'admin.usersFound')}
    </div>
  </div>

  <div class="overflow-hidden rounded-lg border border-[#dde2e9] bg-white">
    <table class="w-full">
      <thead class="bg-[#f8fafc]">
        <tr class="border-b border-[#dde2e9] text-left text-sm font-semibold text-[#586173]">
          <th class="px-4 py-3">
            <button
              class="inline-flex items-center gap-1 hover:text-[#242c39]"
              on:click={() => toggleSort('email')}
            >
              {t($locale, 'admin.email')}
              {#if sortKey === 'email'}
                {#if sortDirection === 'asc'}
                  <ArrowUp class="h-3 w-3" />
                {:else}
                  <ArrowDown class="h-3 w-3" />
                {/if}
              {:else}
                <ArrowUpDown class="h-3 w-3 opacity-40" />
              {/if}
            </button>
          </th>
          <th class="px-4 py-3">
            <button
              class="inline-flex items-center gap-1 hover:text-[#242c39]"
              on:click={() => toggleSort('name')}
            >
              {t($locale, 'admin.name')}
              {#if sortKey === 'name'}
                {#if sortDirection === 'asc'}
                  <ArrowUp class="h-3 w-3" />
                {:else}
                  <ArrowDown class="h-3 w-3" />
                {/if}
              {:else}
                <ArrowUpDown class="h-3 w-3 opacity-40" />
              {/if}
            </button>
          </th>
          <th class="px-4 py-3">
            <button
              class="inline-flex items-center gap-1 hover:text-[#242c39]"
              on:click={() => toggleSort('createdAt')}
            >
              {t($locale, 'admin.createdAt')}
              {#if sortKey === 'createdAt'}
                {#if sortDirection === 'asc'}
                  <ArrowUp class="h-3 w-3" />
                {:else}
                  <ArrowDown class="h-3 w-3" />
                {/if}
              {:else}
                <ArrowUpDown class="h-3 w-3 opacity-40" />
              {/if}
            </button>
          </th>
          <th class="px-4 py-3 text-right">{t($locale, 'admin.actions')}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[#dde2e9]">
        {#if paginatedUsers.length === 0}
          <tr>
            <td colspan="4" class="px-4 py-8 text-center text-sm text-[#707684]">
              {#if searchQuery}
                {t($locale, 'admin.noSearchResults')}
              {:else}
                {t($locale, 'admin.noUsers')}
              {/if}
            </td>
          </tr>
        {:else}
          {#each paginatedUsers as user}
            <tr class="text-sm text-[#242c39] transition-colors hover:bg-[#f8fafc]">
              <td class="px-4 py-3">{user.email}</td>
              <td class="px-4 py-3">{user.name}</td>
              <td class="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td class="px-4 py-3 text-right">
                <form use:enhance method="POST" action="?/deleteUser" class="inline">
                  <input type="hidden" name="userId" value={user.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-[#9b1f2e] hover:bg-[#fff6f6] hover:text-[#c41f3a]"
                    title={t($locale, 'admin.deleteUser')}
                  >
                    <Trash2 class="h-4 w-4" />
                  </Button>
                </form>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if totalPages > 1}
    <div class="flex items-center justify-between">
      <div class="text-sm text-[#707684]">
        Page {currentPage} of {totalPages}
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-8 rounded border-[#ccd3dc] text-xs"
          disabled={currentPage === 1}
          onclick={() => goToPage(currentPage - 1)}
        >
          {t($locale, 'admin.previous')}
        </Button>
        <div class="flex items-center gap-1">
          {#each pageNumbers as page}
            <button
              class="h-8 w-8 rounded text-sm font-medium transition-colors {currentPage === page
                ? 'bg-[#e18e90] text-white'
                : 'text-[#242c39] hover:bg-[#f0d2b8]'}"
              on:click={() => goToPage(page)}
            >
              {page}
            </button>
          {/each}
        </div>
        <Button
          variant="outline"
          className="h-8 rounded border-[#ccd3dc] text-xs"
          disabled={currentPage === totalPages}
          onclick={() => goToPage(currentPage + 1)}
        >
          {t($locale, 'admin.next')}
        </Button>
      </div>
    </div>
  {/if}
</div>
