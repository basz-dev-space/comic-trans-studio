<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { locale, t, type Locale } from '$lib/i18n';
  import ToastViewport from '$lib/components/ToastViewport.svelte';

  const setLocale = (value: Locale) => {
    locale.set(value);
    if (typeof localStorage !== 'undefined') localStorage.setItem('cts-locale', value);
  };

  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('cts-locale') as Locale | null;
    if (saved === 'en' || saved === 'th') locale.set(saved);
  }
</script>

<div class="app-shell flex min-h-screen flex-col">
  <header class="app-container sticky top-0 z-40 py-2">
    <div class="topbar flex flex-wrap items-center justify-between gap-3 px-3 py-2">
      <a class="text-xl font-bold tracking-tight text-[#1c2028]" href="/">{t($locale, 'app.name')}</a>
      <nav class="flex flex-wrap items-center gap-1 text-xs">
        <a class={`rounded px-3 py-1.5 font-semibold ${$page.url.pathname === '/' ? 'bg-white text-[#111]' : 'text-[#576073] hover:bg-white'}`} href="/">{t($locale, 'nav.home')}</a>
        <a class={`rounded px-3 py-1.5 font-semibold ${$page.url.pathname.startsWith('/projects') || $page.url.pathname.startsWith('/project/') ? 'bg-white text-[#111]' : 'text-[#576073] hover:bg-white'}`} href="/projects">{t($locale, 'nav.projects')}</a>
        <a class={`rounded px-3 py-1.5 font-semibold ${$page.url.pathname.startsWith('/login') ? 'bg-white text-[#111]' : 'text-[#576073] hover:bg-white'}`} href="/login">{t($locale, 'nav.login')}</a>
        <div class="ml-2 inline-flex rounded border border-[#cfd4dc] bg-white p-0.5">
          <button class={`rounded px-2 py-1 text-[11px] font-semibold ${$locale === 'en' ? 'bg-[#ff8b31] text-white' : 'text-[#596273]'}`} on:click={() => setLocale('en')}>EN</button>
          <button class={`rounded px-2 py-1 text-[11px] font-semibold ${$locale === 'th' ? 'bg-[#ff8b31] text-white' : 'text-[#596273]'}`} on:click={() => setLocale('th')}>TH</button>
        </div>
      </nav>
    </div>
  </header>

  <main class="app-container min-h-0 flex-1 pb-4">
    <slot />
  </main>

  <ToastViewport />

  <footer class="app-container pb-3">
    <div class="footerbar px-4 py-3 text-xs text-[#616977]">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p class="font-medium">{t($locale, 'footer.tag')}</p>
        <p>{t($locale, 'footer.desc')}</p>
      </div>
    </div>
  </footer>
</div>
