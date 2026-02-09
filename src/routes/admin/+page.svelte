<script lang="ts">
  import { invalidateAll } from '$app/navigation';
  export let data: any;
  let username = '';
  let password = '';
  let newEmail = '';
  let newName = '';
  let newPassword = '';

  const submitCreate = async (e: Event) => {
    e.preventDefault();
    const form = new FormData();
    form.set('email', newEmail);
    form.set('name', newName);
    form.set('password', newPassword);
    const res = await fetch('?/createUser', { method: 'POST', body: form });
      if (res.ok) {
      newEmail = '';
      newName = '';
      newPassword = '';
      await invalidateAll();
    } else {
      const body = await res.json().catch(() => ({}));
      alert(body.error || 'Failed to create user');
    }
  };
</script>

{#if !data.admin}
  <div class="p-6 max-w-md mx-auto">
    <h2 class="text-xl font-semibold mb-4">Admin Login</h2>
    <form method="POST" action="?/login">
      <div class="mb-2">
        <label class="block text-sm">Username</label>
        <input name="username" class="w-full border rounded px-2 py-1" bind:value={username} />
      </div>
      <div class="mb-4">
        <label class="block text-sm">Password</label>
        <input name="password" type="password" class="w-full border rounded px-2 py-1" bind:value={password} />
      </div>
      <button class="bg-blue-600 text-white px-3 py-1 rounded">Login</button>
    </form>
  </div>
{:else}
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-semibold">Admin</h2>
      <form method="POST" action="?/logout"><button class="bg-gray-200 px-2 py-1 rounded">Logout</button></form>
    </div>

    <section class="mb-6">
      <h3 class="font-semibold mb-2">Create user</h3>
      <form on:submit|preventDefault={submitCreate}> 
        <div class="grid grid-cols-3 gap-2 mb-2">
          <input placeholder="Email" class="col-span-1 border rounded px-2 py-1" bind:value={newEmail} />
          <input placeholder="Name" class="col-span-1 border rounded px-2 py-1" bind:value={newName} />
          <input placeholder="Password" type="password" class="col-span-1 border rounded px-2 py-1" bind:value={newPassword} />
        </div>
        <button class="bg-green-600 text-white px-3 py-1 rounded">Create</button>
      </form>
    </section>

    <section>
      <h3 class="font-semibold mb-2">Users</h3>
      <table class="w-full border-collapse">
        <thead>
          <tr class="text-left text-xs text-gray-600"><th class="pb-2">Email</th><th class="pb-2">Name</th><th class="pb-2">Created</th></tr>
        </thead>
        <tbody>
          {#each data.users ?? [] as user}
            <tr class="border-t">
              <td class="py-2">{user.email}</td>
              <td class="py-2">{user.name}</td>
              <td class="py-2">{new Date(user.createdAt).toLocaleString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  </div>
{/if}

<style>
  /* minimal styling */
</style>
