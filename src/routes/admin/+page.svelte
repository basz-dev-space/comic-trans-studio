<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import UserTable from '$lib/components/UserTable.svelte';
  import { locale, t } from '$lib/i18n';
  import { enhance } from '$app/forms';
  import { AlertCircle } from 'lucide-svelte';

  export let data: { admin: boolean; users: Array<{ id: string; email: string; name: string; createdAt: string }> };
  export let form: { error?: string; success?: boolean; form?: { email?: string; name?: string; username?: string } };

  let createUserEmail = form?.form?.email ?? '';
  let createUserName = form?.form?.name ?? '';
  let createUserPassword = '';
  let loginUsername = form?.form?.username ?? '';
  let loginPassword = '';
  let showCreateSuccess = false;

  $: if (form?.success && form?.form) {
    showCreateSuccess = true;
    createUserEmail = '';
    createUserName = '';
    createUserPassword = '';
    setTimeout(() => showCreateSuccess = false, 3000);
  }
</script>

<div class="min-h-[76vh] py-6">
  <div class="mx-auto w-full max-w-4xl">
    {#if !data.admin}
      <div class="surface-card overflow-hidden">
        <div class="border-b border-[#dde2e9] bg-[#f8fafc] px-6 py-5">
          <p class="badge-label">{t($locale, 'admin.loginSubtitle')}</p>
          <h1 class="mt-1 text-3xl font-semibold text-[#171d27]">{t($locale, 'admin.loginTitle')}</h1>
        </div>

        <form method="POST" action="?/login" use:enhance class="space-y-4 p-6">
          {#if form?.error}
            <div class="flex items-center gap-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle class="h-4 w-4" />
              <span>{form.error}</span>
            </div>
          {/if}

          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-[#242c39]" for="username">{t($locale, 'admin.username')}</label>
            <Input
              id="username"
              name="username"
              bind:value={loginUsername}
              required
              className="h-10 rounded border-[#ccd3dc] bg-white"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-sm font-semibold text-[#242c39]" for="password">{t($locale, 'admin.password')}</label>
            <Input
              id="password"
              name="password"
              type="password"
              bind:value={loginPassword}
              required
              className="h-10 rounded border-[#ccd3dc] bg-white"
            />
          </div>

          <Button type="submit" className="h-10 w-full rounded bg-[#ff8b31] text-sm font-semibold text-white hover:bg-[#f57e22]">
            {t($locale, 'admin.loginButton')}
          </Button>
        </form>
      </div>
    {:else}
      <div class="surface-card overflow-hidden">
        <div class="flex items-center justify-between border-b border-[#dde2e9] bg-[#f8fafc] px-6 py-5">
          <div>
            <p class="badge-label">{t($locale, 'admin.dashboardSubtitle')}</p>
            <h1 class="mt-1 text-3xl font-semibold text-[#171d27]">{t($locale, 'admin.dashboardTitle')}</h1>
          </div>
          <form method="POST" action="?/logout">
            <Button type="submit" variant="outline" className="h-10 rounded border-[#ccd3dc]">
              {t($locale, 'admin.logout')}
            </Button>
          </form>
        </div>

        <div class="p-6">
          <section class="mb-8">
            <h2 class="mb-4 text-xl font-semibold text-[#171d27]">{t($locale, 'admin.createUser')}</h2>
            <form method="POST" action="?/createUser" use:enhance class="rounded-lg border border-[#dde2e9] bg-[#f8fafc] p-4">
              {#if form?.error}
                <div class="mb-4 flex items-center gap-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <AlertCircle class="h-4 w-4" />
                  <span>{form.error}</span>
                </div>
              {/if}

              {#if showCreateSuccess}
                <div class="mb-4 flex items-center gap-2 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
                  <span>{t($locale, 'admin.createSuccess')}</span>
                </div>
              {/if}

              <div class="grid gap-4 sm:grid-cols-3">
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-[#242c39]" for="email">{t($locale, 'admin.email')}</label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    bind:value={createUserEmail}
                    placeholder="user@example.com"
                    required
                    className="h-10 rounded border-[#ccd3dc] bg-white"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-[#242c39]" for="name">{t($locale, 'admin.name')}</label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    bind:value={createUserName}
                    placeholder="John Doe"
                    required
                    className="h-10 rounded border-[#ccd3dc] bg-white"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-[#242c39]" for="password">{t($locale, 'admin.password')}</label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    bind:value={createUserPassword}
                    placeholder="******"
                    required
                    className="h-10 rounded border-[#ccd3dc] bg-white"
                  />
                </div>
              </div>
              <div class="mt-4">
                <Button type="submit" className="h-10 rounded bg-[#ff8b31] text-sm font-semibold text-white hover:bg-[#f57e22]">
                  {t($locale, 'admin.createButton')}
                </Button>
              </div>
            </form>
          </section>

          <section>
            <h2 class="mb-4 text-xl font-semibold text-[#171d27]">{t($locale, 'admin.userList')}</h2>
            <UserTable users={data.users} />
          </section>
        </div>
      </div>
    {/if}
  </div>
</div>
