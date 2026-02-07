<script lang="ts">
  import '../app.css';
  import { page } from '$app/stores';
  import { locale, t, type Locale } from '$lib/i18n';

  const setLocale = (value: Locale) => {
    locale.set(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cts-locale', value);
    }
  };

  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('cts-locale') as Locale | null;
    if (saved === 'en' || saved === 'th') locale.set(saved);
  }
</script>

<div class="app-shell flex min-h-screen flex-col">
  <header class="app-container py-4">
    <div class="topbar flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <a class="text-lg font-bold tracking-tight text-[#160204]" href="/">{t($locale, 'app.name')}</a>
      <div class="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <a class={`rounded-3xl px-4 py-2 transition ${$page.url.pathname === '/' ? 'bg-[#f2bc56] text-[#160204]' : 'text-[#5d3438] hover:bg-[#fff2e3]'}`} href="/">{t($locale, 'nav.home')}</a>
        <a
          class={`rounded-3xl px-4 py-2 transition ${$page.url.pathname.startsWith('/projects') || $page.url.pathname.startsWith('/project/') ? 'bg-[#f2bc56] text-[#160204]' : 'text-[#5d3438] hover:bg-[#fff2e3]'}`}
          href="/projects"
          >{t($locale, 'nav.projects')}</a
        >
        <a class={`rounded-3xl px-4 py-2 transition ${$page.url.pathname.startsWith('/login') ? 'bg-[#f2bc56] text-[#160204]' : 'text-[#5d3438] hover:bg-[#fff2e3]'}`} href="/login">{t($locale, 'nav.login')}</a>
        <span class="chip hidden sm:inline-flex">{t($locale, 'nav.search')}</span>
        <div class="inline-flex rounded-3xl border border-[#f0d2b8] bg-white p-1">
          <button class={`rounded-3xl px-3 py-1 text-xs ${$locale === 'en' ? 'bg-[#e18e90] text-[#160204]' : 'text-[#5d3438]'}`} on:click={() => setLocale('en')}>EN</button>
          <button class={`rounded-3xl px-3 py-1 text-xs ${$locale === 'th' ? 'bg-[#e18e90] text-[#160204]' : 'text-[#5d3438]'}`} on:click={() => setLocale('th')}>TH</button>
        </div>
      </div>
    </div>
  </header>

  <main class="app-container min-h-0 flex-1 pb-6">
    <slot />
  </main>

  <footer class="app-container pb-4">
    <div class="footerbar flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-xs text-[#5d3438]">
      <p>{t($locale, 'footer.tag')}</p>
      <p>{t($locale, 'footer.desc')}</p>
    </div>
  </footer>
</div>
